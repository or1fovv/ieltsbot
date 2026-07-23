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

export default router;
