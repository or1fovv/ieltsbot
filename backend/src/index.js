import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import { createBot } from './bot/index.js';
import { startScheduler } from './services/scheduler.service.js';
import { checkSupabaseConnection } from './services/supabase.service.js';
import userRoutes from './api/routes/user.routes.js';
import topicRoutes from './api/routes/topic.routes.js';
import submissionRoutes from './api/routes/submission.routes.js';
import progressRoutes from './api/routes/progress.routes.js';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

// =============================================
// Express server
// =============================================
const app = express();

// Middleware
app.use(cors({
  origin: [config.frontendUrl, config.webAppUrl, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Statik fayllar (audio uploads)
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/user', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/progress', progressRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// =============================================
// Start
// =============================================
async function start() {
  try {
    console.log('🚀 IELTS Bot Backend ishga tushmoqda...');

    // Supabase ulanishini tekshirish
    const supabaseConnected = await checkSupabaseConnection();
    if (supabaseConnected) {
      console.log('✅ Supabase PostgreSQL bog\'landi');
    } else {
      console.warn('⚠️  Supabase bog\'lanish xatosi — faqat API server ishlashda davom etmoqda');
    }

    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Prisma PostgreSQL bog\'landi');
    } catch (error) {
      console.error('❌ Prisma PostgreSQL bog\'lanmadi:', error.message);
      if (config.databaseUrl?.includes('.supabase.co:5432')) {
        console.error('ℹ️  DATABASE_URL direct Supabase hostga ulangan. Lokal muhitda Supabase Dashboard > Project Settings > Database > Connection string > Transaction pooler URL ishlating.');
      }
      console.log('ℹ️  API server ishga tushadi, lekin DB route/bot amallari DATABASE_URL tuzatilmaguncha ishlamaydi.');
    }

    // Express serverni ishga tushirish
    app.listen(config.port, () => {
      console.log(`✅ API server: http://localhost:${config.port}`);
    });

    // Telegram botni ishga tushirish
    if (config.botToken && config.botToken !== 'your_bot_token_from_botfather') {
      try {
        const bot = createBot();
        app.set('bot', bot);

        // bot.launch() polling rejimida hech qachon resolve bo'lmaydi
        // Shuning uchun background da ishlatib, 3s kutib xato tekshiramiz
        let botError = null;
        bot.launch().catch((err) => {
          botError = err;
          console.error('❌ Bot xatosi:', err.message);
        });

        // 3 soniya kutib xato bo'lmasa muvaffaqiyatli
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (botError) {
          console.error('⚠️  Telegram bot ishga tushmadi:', botError.message);
          console.log('ℹ️  API server botsiz ishlashda davom etmoqda...');
        } else {
          console.log('✅ Telegram bot ishga tushdi (polling mode)');
          startScheduler(bot);
          process.once('SIGINT', () => bot.stop('SIGINT'));
          process.once('SIGTERM', () => bot.stop('SIGTERM'));
        }
      } catch (botError) {
        console.error('⚠️  Telegram bot ishga tushmadi:', botError.message);
        console.log('ℹ️  API server botsiz ishlashda davom etmoqda...');
      }
    } else {
      console.warn('⚠️  TELEGRAM_BOT_TOKEN sozlanmagan — bot ishga tushmaydi');
      console.log('ℹ️  API server ishlashda davom etmoqda...');
    }

    console.log('✅ Barcha xizmatlar ishga tushdi!');
  } catch (error) {
    console.error('❌ Ishga tushirishda xato:', error);
    process.exit(1);
  }
}

start();
// Reload triggered

