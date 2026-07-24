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

        // Avval webhook'ni tozalab, clean polling boshlaymiz
        try {
          await bot.telegram.deleteWebhook({ drop_pending_updates: true });
          console.log('ℹ️  Webhook tozalandi, polling boshlandi...');
        } catch (e) {
          // Ignore webhook delete error
        }

        let botStarted = false;
        let botError = null;

        const startPolling = () => {
          botError = null;
          bot.launch({ dropPendingUpdates: true }).catch(async (err) => {
            botError = err;
            // 409 Conflict — boshqa instance ishlayabdi, 5s kutib qayta urinish
            if (err.response?.error_code === 409 || err.message?.includes('409')) {
              console.warn('⚠️  Bot boshqa joyda ishlayabdi (409). 6 soniya kutib qayta uriniladi...');
              await new Promise(r => setTimeout(r, 6000));
              startPolling();
            } else {
              console.error('❌ Bot xatosi:', err.message);
            }
          });
        };

        startPolling();

        // 3 soniya kutib xato bo'lmasa muvaffaqiyatli deb hisoblaymiz
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (!botError) {
          botStarted = true;
          console.log('✅ Telegram bot ishga tushdi (polling mode)');
          startScheduler(bot);
          process.once('SIGINT', () => bot.stop('SIGINT'));
          process.once('SIGTERM', () => bot.stop('SIGTERM'));
        } else if (botError?.response?.error_code === 409 || botError?.message?.includes('409')) {
          console.warn('⚠️  Bot 409 xatosi — qayta urinilmoqda, API server ishlashda davom etmoqda...');
        } else {
          console.error('⚠️  Telegram bot ishga tushmadi:', botError.message);
          console.log('ℹ️  API server botsiz ishlashda davom etmoqda...');
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

