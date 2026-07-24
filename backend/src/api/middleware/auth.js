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
 * Express middleware — Telegram WebApp yoki Veb Autentifikatsiya
 */
export function telegramAuthMiddleware(req, res, next) {
  if (req.telegramUser || req.webUserId) {
    return next();
  }

  // 1. Telegram WebApp initData header
  const initData = req.headers['x-telegram-init-data'];
  if (initData) {
    const telegramUser = validateTelegramInitData(initData);
    if (telegramUser) {
      req.telegramUser = telegramUser;
      return next();
    }
  }

  // 2. Direct Web auth header (x-web-user-id yoki Authorization header)
  const webUserId = req.headers['x-web-user-id'] || req.headers['authorization']?.replace('Bearer ', '');
  if (webUserId) {
    req.webUserId = webUserId;
    return next();
  }

  // 3. Autentifikatsiya topilmadi
  return res.status(401).json({
    error: 'Autentifikatsiya talab qilinadi',
    message: 'Iltimos, Telegram Mini App yoki Veb orqali tizimga kiring',
  });
}

/**
 * Foydalanuvchini DB'dan topish yoki yaratish
 */
export async function resolveUserMiddleware(req, res, next) {
  try {
    let user = null;

    // A) Telegram user
    if (req.telegramUser) {
      const tgUser = req.telegramUser;
      user = await prisma.user.findUnique({
        where: { telegramId: BigInt(tgUser.id) },
        include: { progressStats: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramId: BigInt(tgUser.id),
            firstName: tgUser.first_name || 'Foydalanuvchi',
            lastName: tgUser.last_name || null,
            username: tgUser.username || null,
            progressStats: { create: {} },
          },
          include: { progressStats: true },
        });
      }
    }
    // B) Web user ID or Username
    else if (req.webUserId) {
      const webId = req.webUserId;

      // Try finding by UUID id
      if (webId.length > 20) {
        user = await prisma.user.findUnique({
          where: { id: webId },
          include: { progressStats: true },
        });
      }

      // If not found, try finding by username or numeric telegramId
      if (!user) {
        const cleanUsername = webId.replace('@', '');
        const isNumeric = /^\d+$/.test(cleanUsername);

        user = await prisma.user.findFirst({
          where: isNumeric
            ? { telegramId: BigInt(cleanUsername) }
            : { username: { equals: cleanUsername, mode: 'insensitive' } },
          include: { progressStats: true },
        });
      }

      // If user still not found, let's create a new user dynamically (Web User)
      if (!user) {
        const cleanName = webId.replace('@', '').substring(0, 30);
        // Generate a random big integer for telegramId to avoid database unique constraint
        const randomTgId = BigInt(Math.floor(100000000 + Math.random() * 900000000));
        
        user = await prisma.user.create({
          data: {
            telegramId: randomTgId,
            firstName: cleanName || 'Web User',
            username: cleanName.toLowerCase() || 'webuser',
            progressStats: { create: {} },
          },
          include: { progressStats: true },
        });
        console.log(`👤 New web user created dynamically: ${cleanName} (ID: ${user.id})`);
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Foydalanuvchi topilmadi. Qayta ro\'yxatdan o\'ting.' });
    }

    const adminEmails = ['maxmudorifov36@gmail.com', 'orifovdev@gmail.com', 'or1fovv@gmail.com', 'maxa@gmail.com', 'admin@gmail.com'];
    const isAdminUser = adminEmails.includes((user.email || '').toLowerCase()) ||
      (user.username || '').toLowerCase().includes('maxa') ||
      (user.username || '').toLowerCase().includes('or1fovv') ||
      (user.email || '').toLowerCase().includes('maxmudorifov36');

    // Format for request context
    req.user = {
      ...user,
      role: isAdminUser ? 'admin' : user.role,
      isPremium: isAdminUser ? true : user.isPremium,
      telegramId: user.telegramId.toString(),
    };

    next();
  } catch (error) {
    console.error('Resolve user error:', error);
    res.status(500).json({ error: 'Foydalanuvchini aniqlashda xato' });
  }
}

/**
 * Dev mode middleware
 */
export function devAuthMiddleware(req, res, next) {
  if (config.nodeEnv === 'development' && !req.headers['x-telegram-init-data'] && !req.headers['x-web-user-id'] && !req.headers['authorization']) {
    req.webUserId = 'demo-user-dev';
  }
  next();
}

export default {
  validateTelegramInitData,
  telegramAuthMiddleware,
  resolveUserMiddleware,
  devAuthMiddleware,
};
