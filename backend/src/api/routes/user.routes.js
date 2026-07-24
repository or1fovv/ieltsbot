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
// POST /api/user/auth-email — Gmail / Email orqali kirish / ro'yxatdan o'tish
// =============================================
router.post('/auth-email', async (req, res) => {
  try {
    const { email, name, levelSystem, currentLevel } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Iltimos, to\'g\'ri Gmail / Email manzilini kiriting' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminEmails = ['orifovdev@gmail.com', 'or1fovv@gmail.com', 'maxa@gmail.com', 'admin@gmail.com'];
    const isAdmin = adminEmails.includes(cleanEmail) || cleanEmail.startsWith('maxa') || cleanEmail.startsWith('or1fovv');

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanEmail.split('@')[0] }
        ]
      },
      include: { progressStats: true },
    });

    if (user) {
      // Ensure admin email has role='admin'
      if (isAdmin && user.role !== 'admin') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin', isPremium: true },
          include: { progressStats: true },
        });
      }
    } else {
      // Create new user with email
      const generatedTelegramId = BigInt(Math.floor(100000000 + Math.random() * 900000000));
      const baseUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/gi, '');
      const uniqueUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
      const displayName = name || baseUsername;

      user = await prisma.user.create({
        data: {
          telegramId: generatedTelegramId,
          firstName: displayName,
          username: uniqueUsername,
          email: cleanEmail,
          role: isAdmin ? 'admin' : 'user',
          isPremium: isAdmin ? true : false,
          levelSystem: levelSystem || 'ielts',
          currentLevel: currentLevel || '5.0',
          language: 'uz',
          progressStats: { create: {} },
        },
        include: { progressStats: true },
      });
      console.log(`✉️ New user registered via Email: ${cleanEmail} (Role: ${user.role})`);
    }

    res.json({
      token: user.id,
      user: {
        ...user,
        telegramId: user.telegramId.toString(),
      },
    });
  } catch (error) {
    console.error('Email Auth Error:', error);
    res.status(500).json({ error: 'Email orqali kirishda xatolik yuz berdi: ' + error.message });
  }
});

// =============================================
// GET /api/user/admin/users — Admin: Barcha foydalanuvchilar ro'yxati
// =============================================
router.get('/admin/users', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin ruxsati kerak' });
    }

    const users = await prisma.user.findMany({
      include: { progressStats: true },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map(u => ({
      ...u,
      telegramId: u.telegramId.toString(),
    }));

    res.json({ users: formatted });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Foydalanuvchilarni olishda xato' });
  }
});

// =============================================
// POST /api/user/admin/user-action — Admin: Foydalanuvchini boshqarish (Premium, Limit, Delete, Role)
// =============================================
router.post('/admin/user-action', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin ruxsati kerak' });
    }

    const { targetUserId, action, value } = req.body;
    if (!targetUserId || !action) {
      return res.status(400).json({ error: 'targetUserId va action parametrlari kerak' });
    }

    let updatedUser = null;

    if (action === 'toggle_premium') {
      updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { isPremium: value },
      });
    } else if (action === 'reset_limit') {
      updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { testsToday: 0 },
      });
    } else if (action === 'set_role') {
      updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: value },
      });
    } else if (action === 'delete') {
      await prisma.user.delete({
        where: { id: targetUserId },
      });
      return res.json({ success: true, message: 'Foydalanuvchi o\'chirildi' });
    }

    res.json({
      success: true,
      user: updatedUser ? { ...updatedUser, telegramId: updatedUser.telegramId.toString() } : null,
    });
  } catch (error) {
    console.error('Admin action error:', error);
    res.status(500).json({ error: 'Amalni bajarishda xato: ' + error.message });
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

// =============================================
// POST /api/user/login-google — Google OAuth orqali kirish
// =============================================
router.post('/login-google', async (req, res) => {
  try {
    const { email, name, avatarUrl, supabaseId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email manzili talab qilinadi' });
    }

    // Google email orqali bazadan qidiramiz
    let user = await prisma.user.findUnique({
      where: { email },
      include: { progressStats: true }
    });

    // faqat sizning Google pochtalaringiz admin bo'la oladi
    const adminEmails = ['orifovdev@gmail.com', 'or1fovv@gmail.com', 'maxa@gmail.com', 'admin@gmail.com'];
    const isAdminEmail = adminEmails.includes(email.toLowerCase());

    if (user) {
      // Mavjud user role'ni va premium statusni yangilash
      if (isAdminEmail && user.role !== 'admin') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin', isPremium: true },
          include: { progressStats: true }
        });
      }
    } else {
      // Yangi Google foydalanuvchisi yaratamiz
      const generatedTelegramId = BigInt(Math.floor(100000000 + Math.random() * 900000000));
      
      user = await prisma.user.create({
        data: {
          telegramId: generatedTelegramId,
          firstName: name || email.split('@')[0],
          username: email.split('@')[0],
          email: email.toLowerCase(),
          role: isAdminEmail ? 'admin' : 'user',
          isPremium: isAdminEmail ? true : false,
          levelSystem: 'ielts',
          currentLevel: '6.0',
          language: 'uz',
          progressStats: { create: {} },
        },
        include: { progressStats: true }
      });
      console.log(`👤 New user registered via Google: ${email} (Role: ${user.role})`);
    }

    res.json({
      token: user.id,
      user: {
        ...user,
        telegramId: user.telegramId.toString(),
      },
    });
  } catch (error) {
    console.error('Google Auth backend error:', error);
    res.status(500).json({ error: 'Google orqali kirishda xatolik yuz berdi' });
  }
});

export default router;
