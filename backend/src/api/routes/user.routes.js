import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { telegramAuthMiddleware, resolveUserMiddleware, devAuthMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Dev mode middleware
router.use(devAuthMiddleware);

// =============================================
// GET /api/user — Joriy foydalanuvchi profilini olish
// =============================================
router.get('/', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role, // role "admin" yoki "user"
      levelSystem: user.levelSystem,
      currentLevel: user.currentLevel,
      language: user.language,
      isPremium: user.isPremium,
      progressStats: user.progressStats,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Profil olishda xato' });
  }
});

// =============================================
// POST /api/user/login — Veb brauzer orqali tezkor kirish (Username / ID / Name)
// =============================================
router.post('/login', async (req, res) => {
  try {
    const { identifier, name, levelSystem, currentLevel } = req.body;

    if (!identifier || identifier.trim().length === 0) {
      return res.status(400).json({ error: 'Telegram username yoki ismingizni kiriting' });
    }

    const cleanInput = identifier.trim().replace('@', '');
    const isNumeric = /^\d+$/.test(cleanInput);

    let user = null;

    if (isNumeric) {
      user = await prisma.user.findUnique({
        where: { telegramId: BigInt(cleanInput) },
        include: { progressStats: true },
      });
    } else {
      user = await prisma.user.findFirst({
        where: { username: { equals: cleanInput, mode: 'insensitive' } },
        include: { progressStats: true },
      });
    }

    // "maxa" yoki "or1fovv" bo'lsa uni avtomatik Admin qilish qoidasi
    const isAdminUser = cleanInput.toLowerCase() === 'maxa' || cleanInput.toLowerCase() === 'or1fovv';

    if (user) {
      // Role va isPremium'ni to'g'irlash (kerak bo'lsa)
      if (isAdminUser && user.role !== 'admin') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin', isPremium: true },
          include: { progressStats: true },
        });
      }
    } else {
      // Yangi akkount yaratish
      const generatedTelegramId = isNumeric ? BigInt(cleanInput) : BigInt(Math.floor(100000000 + Math.random() * 900000000));
      const displayName = name || cleanInput;

      user = await prisma.user.create({
        data: {
          telegramId: generatedTelegramId,
          firstName: displayName,
          username: isNumeric ? null : cleanInput,
          role: isAdminUser ? 'admin' : 'user',
          isPremium: isAdminUser ? true : false,
          levelSystem: levelSystem || 'ielts',
          currentLevel: currentLevel || '5.0',
          language: 'uz',
          progressStats: { create: {} },
        },
        include: { progressStats: true },
      });
    }

    res.json({
      token: user.id,
      user: {
        ...user,
        telegramId: user.telegramId.toString(),
      },
    });
  } catch (error) {
    console.error('Web login error:', error);
    res.status(500).json({ error: 'Veb orqali kirishda xatolik yuz berdi' });
  }
});

// =============================================
// POST /api/user/register — Ro'yxatdan o'tish / yangilash
// =============================================
router.post('/register', telegramAuthMiddleware, async (req, res) => {
  try {
    const tgUser = req.telegramUser;
    const { levelSystem, currentLevel, language } = req.body;

    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      create: {
        telegramId: BigInt(tgUser.id),
        firstName: tgUser.first_name || 'Foydalanuvchi',
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
        levelSystem: levelSystem || 'ielts',
        currentLevel: currentLevel || '5.0',
        language: language || 'uz',
        progressStats: { create: {} },
      },
      update: {
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        ...(levelSystem && { levelSystem }),
        ...(currentLevel && { currentLevel }),
        ...(language && { language }),
      },
      include: { progressStats: true },
    });

    res.json({
      ...user,
      telegramId: user.telegramId.toString(),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Ro\'yxatdan o\'tishda xato' });
  }
});

// =============================================
// PUT /api/user/settings — Sozlamalarni yangilash
// =============================================
router.put('/settings', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    const { levelSystem, currentLevel, language, timezone } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(levelSystem && { levelSystem }),
        ...(currentLevel && { currentLevel }),
        ...(language && { language }),
        ...(timezone && { timezone }),
      },
    });

    res.json({
      ...updated,
      telegramId: updated.telegramId.toString(),
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Sozlamalarni yangilashda xato' });
  }
});

// =============================================
// POST /api/user/reset-limit — Admin orqali joriy limitni nollash (testlash uchun)
// =============================================
router.post('/reset-limit', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Ruxsat berilmadi', message: 'Ushbu amalni bajarish uchun siz admin emassiz.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { testsToday: 0 },
    });
    res.json({ success: true, message: 'Limit muvaffaqiyatli nollashdi!', testsToday: 0 });
  } catch (error) {
    console.error('Reset limit error:', error);
    res.status(500).json({ error: 'Limitni nollashda xato' });
  }
});

// =============================================
// POST /api/user/upgrade-premium — Premium obunani yoqish/o'chirish
// =============================================
router.post('/upgrade-premium', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Ruxsat berilmadi', message: 'Ushbu amalni bajarish uchun siz admin emassiz.' });
    }

    const { isPremium } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { isPremium: isPremium ?? true },
    });
    res.json({
      success: true,
      message: updated.isPremium ? 'Premium muvaffaqiyatli faollashtirildi!' : 'Premium o\'chirildi!',
      isPremium: updated.isPremium,
      user: {
        ...updated,
        telegramId: updated.telegramId.toString()
      }
    });
  } catch (error) {
    console.error('Upgrade premium error:', error);
    res.status(500).json({ error: 'Obunani yangilashda xato: ' + error.message });
  }
});

export default router;
