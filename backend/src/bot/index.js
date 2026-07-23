import { Telegraf } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/env.js';
import { getTexts, formatFeedback } from './texts.js';
import {
  mainMenuKeyboard,
  levelSystemKeyboard,
  ieltsLevelKeyboard,
  cefrLevelKeyboard,
  languageKeyboard,
  testTypeKeyboard,
  speakingPartKeyboard,
  writingTaskKeyboard,
  tryAgainKeyboard,
} from './keyboards.js';
import { getTodayTopics } from '../services/topic.service.js';
import { evaluateWriting, evaluateSpeaking } from '../services/ai.service.js';
import { transcribeAudio } from '../services/stt.service.js';
import {
  createSubmission,
  getProgressStats,
  checkDailyLimit,
  incrementTestCount,
} from '../services/scoring.service.js';
import { markTopicUsed } from '../services/topic.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

// Foydalanuvchi holatlari (session)
const userSessions = new Map();

function getSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {});
  }
  return userSessions.get(userId);
}

/**
 * Telegram botni yaratish va sozlash
 * @returns {Telegraf} bot instance
 */
export function createBot() {
  const bot = new Telegraf(config.botToken);

  // =============================================
  // /start — Ro'yxatdan o'tish
  // =============================================
  bot.start(async (ctx) => {
    try {
      const tgUser = ctx.from;
      let user = await prisma.user.findUnique({
        where: { telegramId: BigInt(tgUser.id) },
        include: { progressStats: true },
      });

      const session = getSession(tgUser.id);
      session.state = 'idle';

      if (user) {
        // Mavjud foydalanuvchi
        const t = getTexts(user.language);
        await ctx.replyWithMarkdown(
          t.registrationComplete(user.currentLevel),
          mainMenuKeyboard(user.language)
        );
      } else {
        // Yangi foydalanuvchi — til tanlash
        session.state = 'registration_language';
        await ctx.replyWithMarkdown(
          getTexts('uz').welcome(tgUser.first_name),
          languageKeyboard()
        );
      }
    } catch (error) {
      console.error('Start command error:', error);
      await ctx.reply('❌ Xato yuz berdi. Iltimos /start ni qaytadan bosing.');
    }
  });

  // =============================================
  // Til tanlash callback
  // =============================================
  bot.action(/^lang_(.+)$/, async (ctx) => {
    try {
      const lang = ctx.match[1]; // uz, ru, en
      const session = getSession(ctx.from.id);
      session.language = lang;
      session.state = 'registration_level_system';

      const t = getTexts(lang);
      await ctx.answerCbQuery();
      await ctx.editMessageText(t.chooseLevelSystem, levelSystemKeyboard());
    } catch (error) {
      console.error('Language selection error:', error);
    }
  });

  // =============================================
  // Daraja tizimi tanlash
  // =============================================
  bot.action(/^level_(ielts|cefr)$/, async (ctx) => {
    try {
      const system = ctx.match[1];
      const session = getSession(ctx.from.id);
      session.levelSystem = system;
      session.state = 'registration_level';

      const t = getTexts(session.language || 'uz');
      await ctx.answerCbQuery();

      if (system === 'ielts') {
        await ctx.editMessageText(t.chooseLevel, ieltsLevelKeyboard());
      } else {
        await ctx.editMessageText(t.chooseLevel, cefrLevelKeyboard());
      }
    } catch (error) {
      console.error('Level system selection error:', error);
    }
  });

  // =============================================
  // IELTS daraja tanlash
  // =============================================
  bot.action(/^ielts_(.+)$/, async (ctx) => {
    try {
      const level = ctx.match[1];
      await completeRegistration(ctx, 'ielts', level);
    } catch (error) {
      console.error('IELTS level selection error:', error);
    }
  });

  // =============================================
  // CEFR daraja tanlash
  // =============================================
  bot.action(/^cefr_(.+)$/, async (ctx) => {
    try {
      const level = ctx.match[1];
      await completeRegistration(ctx, 'cefr', level);
    } catch (error) {
      console.error('CEFR level selection error:', error);
    }
  });

  // =============================================
  // Ro'yxatdan o'tishni yakunlash
  // =============================================
  async function completeRegistration(ctx, levelSystem, level) {
    const tgUser = ctx.from;
    const session = getSession(tgUser.id);
    const lang = session.language || 'uz';

    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      create: {
        telegramId: BigInt(tgUser.id),
        firstName: tgUser.first_name || 'Foydalanuvchi',
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
        levelSystem,
        currentLevel: level,
        language: lang,
        progressStats: { create: {} },
      },
      update: {
        levelSystem,
        currentLevel: level,
        language: lang,
      },
    });

    session.state = 'idle';

    const t = getTexts(lang);
    await ctx.answerCbQuery();
    await ctx.editMessageText(t.registrationComplete(level), { parse_mode: 'Markdown' });
    await ctx.reply('👇 Tanlang:', mainMenuKeyboard(lang));
  }

  // =============================================
  // /test — Test boshlash
  // =============================================
  bot.command('test', async (ctx) => {
    await startTest(ctx);
  });

  bot.action('menu_test', async (ctx) => {
    await ctx.answerCbQuery();
    await startTest(ctx);
  });

  async function startTest(ctx) {
    try {
      const user = await getUser(ctx.from.id);
      if (!user) {
        return ctx.reply('Avval /start buyrug\'ini bosing.');
      }

      const limit = await checkDailyLimit(user.id);
      const t = getTexts(user.language);

      if (!limit.allowed) {
        return ctx.replyWithMarkdown(t.limitReached, mainMenuKeyboard(user.language));
      }

      const session = getSession(ctx.from.id);
      session.state = 'choosing_test_type';

      await ctx.replyWithMarkdown(
        `${t.chooseTestType}\n\n💡 Qolgan bepul testlar: **${limit.remaining}**`,
        testTypeKeyboard(user.language)
      );
    } catch (error) {
      console.error('Start test error:', error);
      await ctx.reply(getTexts('uz').error);
    }
  }

  // =============================================
  // Test turi tanlash
  // =============================================
  bot.action('test_speaking', async (ctx) => {
    try {
      const session = getSession(ctx.from.id);
      session.testType = 'speaking';
      session.state = 'choosing_subtype';

      await ctx.answerCbQuery();
      await ctx.editMessageText('🎙 Speaking Part tanlang:', speakingPartKeyboard());
    } catch (error) {
      console.error('Test type selection error:', error);
    }
  });

  bot.action('test_writing', async (ctx) => {
    try {
      const session = getSession(ctx.from.id);
      session.testType = 'writing';
      session.state = 'choosing_subtype';

      await ctx.answerCbQuery();
      await ctx.editMessageText('✍️ Writing Task tanlang:', writingTaskKeyboard());
    } catch (error) {
      console.error('Test type selection error:', error);
    }
  });

  // =============================================
  // Speaking Part tanlash
  // =============================================
  bot.action(/^speak_(part[1-3])$/, async (ctx) => {
    try {
      const subtype = ctx.match[1];
      await loadTopic(ctx, 'speaking', subtype);
    } catch (error) {
      console.error('Speaking part selection error:', error);
    }
  });

  // =============================================
  // Writing Task tanlash
  // =============================================
  bot.action(/^write_(task[1-2])$/, async (ctx) => {
    try {
      const subtype = ctx.match[1];
      await loadTopic(ctx, 'writing', subtype);
    } catch (error) {
      console.error('Writing task selection error:', error);
    }
  });

  // =============================================
  // Mavzuni yuklash va ko'rsatish
  // =============================================
  async function loadTopic(ctx, type, subtype) {
    const user = await getUser(ctx.from.id);
    if (!user) return;

    const session = getSession(ctx.from.id);
    const t = getTexts(user.language);

    await ctx.answerCbQuery();
    await ctx.editMessageText('⏳ Mavzu tayyorlanmoqda...');

    try {
      // Bugungi mavzularni olish
      const topics = await getTodayTopics(user.levelSystem, user.currentLevel, type);
      const topic = topics.find(tp => tp.subtype === subtype) || topics[0];

      if (!topic) {
        return ctx.editMessageText('❌ Mavzu topilmadi. Keyinroq urinib ko\'ring.');
      }

      // Mavzu ma'lumotlarini topicData dan olish
      const topicData = topic.topicData || {};
      let topicDisplay = topic.topicText;

      if (topicData.instructions) {
        topicDisplay += `\n\n📝 _${topicData.instructions}_`;
      }
      if (topicData.time_limit_minutes) {
        topicDisplay += `\n⏱ Vaqt: ${topicData.time_limit_minutes} daqiqa`;
      }
      if (topicData.word_limit) {
        topicDisplay += `\n📏 Kamida ${topicData.word_limit} so'z`;
      }

      session.state = 'waiting_answer';
      session.testType = type;
      session.testSubtype = subtype;
      session.currentTopic = topic;

      const formattedText = t.topicReady(topicDisplay);

      if (topicData.image_url) {
        await ctx.deleteMessage().catch(() => {});
        await ctx.replyWithPhoto(topicData.image_url, {
          caption: formattedText,
          parse_mode: 'Markdown',
        });
      } else {
        await ctx.editMessageText(formattedText, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error('Load topic error:', error);
      await ctx.editMessageText(t.error);
    }
  }

  // =============================================
  // Voice xabar handler (Speaking javob)
  // =============================================
  bot.on('voice', async (ctx) => {
    try {
      const user = await getUser(ctx.from.id);
      if (!user) return ctx.reply('Avval /start buyrug\'ini bosing.');

      const session = getSession(ctx.from.id);
      const t = getTexts(user.language);

      // Faol test borligini tekshirish
      if (session.state !== 'waiting_answer' || session.testType !== 'speaking') {
        // Shart emas, erkin speaking test sifatida qabul qilish
        session.testType = 'speaking';
        session.testSubtype = 'part2';
        session.currentTopic = null;
      }

      // Audio hajmini tekshirish
      if (ctx.message.voice.duration < 5) {
        return ctx.reply(t.audioTooShort);
      }

      const processingMsg = await ctx.reply(t.processingAudio);

      // Audio faylni yuklab olish
      const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
      const uploadsDir = path.resolve(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `voice_${ctx.from.id}_${Date.now()}.ogg`;
      const filePath = path.join(uploadsDir, fileName);

      // Faylni yuklab olish
      const response = await fetch(fileLink.href);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Speech-to-text
      let transcript;
      try {
        transcript = await transcribeAudio(filePath);
      } catch (sttError) {
        console.error('STT error:', sttError);
        return ctx.reply('❌ Ovozni tanib olishda xato. Iltimos qaytadan yuboring.');
      }

      if (!transcript || transcript.trim().length < 5) {
        return ctx.reply('⚠️ Ovoz tanib olinmadi. Iltimos aniqroq gapiring.');
      }

      // AI baholash
      const topicText = session.currentTopic?.topicText || 'Free speaking practice';
      const feedback = await evaluateSpeaking({
        topicText,
        transcript,
        subtype: session.testSubtype || 'part2',
        levelSystem: user.levelSystem,
        language: user.language,
      });

      // Submission saqlash
      await createSubmission({
        userId: user.id,
        topicId: session.currentTopic?.id || null,
        type: 'speaking',
        subtype: session.testSubtype || 'part2',
        audioUrl: `/uploads/${fileName}`,
        transcript,
        feedbackJson: feedback,
        bandScore: feedback.band_score,
        cefrLevel: feedback.cefr_level,
      });

      await incrementTestCount(user.id);
      if (session.currentTopic) {
        await markTopicUsed(user.id, session.currentTopic.id);
      }

      // Natija yuborish
      const feedbackText = formatFeedback(feedback, 'speaking', user.language);
      await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id).catch(() => {});
      await ctx.replyWithMarkdown(feedbackText, tryAgainKeyboard(user.language));

      session.state = 'idle';
      session.currentTopic = null;
    } catch (error) {
      console.error('Voice handler error:', error);
      await ctx.reply(getTexts('uz').error);
    }
  });

  // =============================================
  // Text xabar handler (Writing javob)
  // =============================================
  bot.on('text', async (ctx) => {
    // Buyruqlar uchun skip
    if (ctx.message.text.startsWith('/')) return;

    try {
      const user = await getUser(ctx.from.id);
      if (!user) return;

      const session = getSession(ctx.from.id);
      const t = getTexts(user.language);

      // Agar faol test bo'lmasa, writing test sifatida qabul qilish
      if (session.state !== 'waiting_answer') {
        // Erkin writing test sifatida qabul qilish
        if (ctx.message.text.length < 30) return; // Qisqa xabarlarni e'tiborsiz qoldirish
        session.testType = 'writing';
        session.testSubtype = 'task2';
        session.currentTopic = null;
      }

      const content = ctx.message.text;

      if (content.length < 20) {
        return ctx.reply(t.textTooShort);
      }

      const processingMsg = await ctx.reply(t.processing);

      // AI baholash
      const topicText = session.currentTopic?.topicText || 'Free writing practice';
      const feedback = await evaluateWriting({
        topicText,
        answer: content,
        subtype: session.testSubtype || 'task2',
        levelSystem: user.levelSystem,
        language: user.language,
      });

      // Submission saqlash
      await createSubmission({
        userId: user.id,
        topicId: session.currentTopic?.id || null,
        type: 'writing',
        subtype: session.testSubtype || 'task2',
        content,
        feedbackJson: feedback,
        bandScore: feedback.band_score,
        cefrLevel: feedback.cefr_level,
      });

      await incrementTestCount(user.id);
      if (session.currentTopic) {
        await markTopicUsed(user.id, session.currentTopic.id);
      }

      // Natija yuborish
      const feedbackText = formatFeedback(feedback, 'writing', user.language);
      await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id).catch(() => {});
      await ctx.replyWithMarkdown(feedbackText, tryAgainKeyboard(user.language));

      // Yaxshilangan versiya alohida yuborish
      if (feedback.improved_version) {
        await ctx.replyWithMarkdown(`📝 **Yaxshilangan versiya:**\n\n_${feedback.improved_version}_`);
      }

      session.state = 'idle';
      session.currentTopic = null;
    } catch (error) {
      console.error('Text handler error:', error);
      await ctx.reply(getTexts('uz').error);
    }
  });

  // =============================================
  // /profile — Profil
  // =============================================
  bot.command('profile', async (ctx) => {
    await showProfile(ctx);
  });

  bot.action('menu_profile', async (ctx) => {
    await ctx.answerCbQuery();
    await showProfile(ctx);
  });

  async function showProfile(ctx) {
    try {
      const user = await getUser(ctx.from.id);
      if (!user) return ctx.reply('Avval /start buyrug\'ini bosing.');

      const stats = await getProgressStats(user.id);
      const t = getTexts(user.language);

      await ctx.replyWithMarkdown(
        t.profileInfo(user, stats),
        mainMenuKeyboard(user.language)
      );
    } catch (error) {
      console.error('Profile error:', error);
      await ctx.reply(getTexts('uz').error);
    }
  }

  // =============================================
  // /progress — Progress
  // =============================================
  bot.command('progress', async (ctx) => {
    await showProgress(ctx);
  });

  bot.action('menu_progress', async (ctx) => {
    await ctx.answerCbQuery();
    await showProgress(ctx);
  });

  async function showProgress(ctx) {
    try {
      const user = await getUser(ctx.from.id);
      if (!user) return ctx.reply('Avval /start buyrug\'ini bosing.');

      const stats = await getProgressStats(user.id);
      const t = getTexts(user.language);

      await ctx.replyWithMarkdown(
        t.progressInfo(stats),
        mainMenuKeyboard(user.language)
      );
    } catch (error) {
      console.error('Progress error:', error);
      await ctx.reply(getTexts('uz').error);
    }
  }

  // =============================================
  // /help — Yordam
  // =============================================
  bot.command('help', async (ctx) => {
    await showHelp(ctx);
  });

  bot.action('menu_help', async (ctx) => {
    await ctx.answerCbQuery();
    await showHelp(ctx);
  });

  async function showHelp(ctx) {
    const user = await getUser(ctx.from.id);
    const t = getTexts(user?.language || 'uz');
    await ctx.replyWithMarkdown(t.helpText, mainMenuKeyboard(user?.language));
  }

  // =============================================
  // Bosh menyu
  // =============================================
  bot.action('menu_main', async (ctx) => {
    const user = await getUser(ctx.from.id);
    await ctx.answerCbQuery();
    await ctx.reply('👇 Tanlang:', mainMenuKeyboard(user?.language));
  });

  // =============================================
  // Cancel
  // =============================================
  bot.action('cancel', async (ctx) => {
    const session = getSession(ctx.from.id);
    session.state = 'idle';
    session.currentTopic = null;
    await ctx.answerCbQuery();
    await ctx.editMessageText('❌ Bekor qilindi.');
  });

  // =============================================
  // Yordamchi funksiyalar
  // =============================================
  async function getUser(telegramId) {
    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramId) },
        include: { progressStats: true },
      });
      if (user) {
        return { ...user, telegramId: user.telegramId.toString() };
      }
      return null;
    } catch {
      return null;
    }
  }

  // Error handler
  bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ Xato yuz berdi. Iltimos /start buyrug\'ini bosing.').catch(() => {});
  });

  return bot;
}

export default { createBot };
