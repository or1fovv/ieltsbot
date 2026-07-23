import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import config from '../../config/env.js';

const prisma = new PrismaClient();

/**
 * Telegram WebApp initData ni tekshirish (HMAC-SHA256)
 * @param {string} initData - Telegram WebApp dan kelgan initData string
 * @returns {Object|null} - tekshirish muvaffaqiyatli bo'lsa user data, aks holda null
 */
export function validateTelegramInitData(initData) {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    // Parametrlarni saralash
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // HMAC-SHA256 hisoblash
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return null;
    }

    // User ma'lumotlarini ajratish
    const userStr = params.get('user');
    if (!userStr) return null;

    return JSON.parse(userStr);
  } catch (error) {
    console.error('Telegram initData validation error:', error);
    return null;
  }
}

/**
 * Express middleware — Telegram WebApp autentifikatsiya
 */
export function telegramAuthMiddleware(req, res, next) {
  if (req.telegramUser) {
    return next();
  }

  const initData = req.headers['x-telegram-init-data'];

  if (!initData) {
    return res.status(401).json({
      error: 'Autentifikatsiya talab qilinadi',
      message: 'Telegram WebApp initData topilmadi',
    });
  }

  const telegramUser = validateTelegramInitData(initData);

  if (!telegramUser) {
    return res.status(401).json({
      error: 'Noto\'g\'ri autentifikatsiya',
      message: 'Telegram initData tekshiruvdan o\'tmadi',
    });
  }

  req.telegramUser = telegramUser;
  next();
}

/**
 * Telegram foydalanuvchisini DB'dan topish yoki yaratish
 * Middleware — telegramAuthMiddleware dan keyin ishlatiladi
 */
export async function resolveUserMiddleware(req, res, next) {
  try {
    const tgUser = req.telegramUser;
    if (!tgUser) {
      return res.status(401).json({ error: 'Foydalanuvchi aniqlanmadi' });
    }

    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(tgUser.id) },
      include: { progressStats: true },
    });

    if (!user) {
      // Yangi foydalanuvchi yaratish
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(tgUser.id),
          firstName: tgUser.first_name || 'Foydalanuvchi',
          lastName: tgUser.last_name || null,
          username: tgUser.username || null,
          progressStats: {
            create: {},
          },
        },
        include: { progressStats: true },
      });
    }

    // BigInt ni string ga o'girish (JSON serialization uchun)
    req.user = {
      ...user,
      telegramId: user.telegramId.toString(),
    };

    next();
  } catch (error) {
    console.error('Resolve user error:', error);
    res.status(500).json({ error: 'Foydalanuvchini aniqlashda xato' });
  }
}

/**
 * Dev mode middleware — development uchun auth skip
 */
export function devAuthMiddleware(req, res, next) {
  if (config.nodeEnv === 'development' && !req.headers['x-telegram-init-data']) {
    // Dev modda test user
    req.telegramUser = {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
    };
  }
  next();
}

export default {
  validateTelegramInitData,
  telegramAuthMiddleware,
  resolveUserMiddleware,
  devAuthMiddleware,
};
