import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { telegramAuthMiddleware, resolveUserMiddleware, devAuthMiddleware } from '../middleware/auth.js';
import { evaluateWriting, evaluateSpeaking } from '../../services/ai.service.js';
import { transcribeAudio } from '../../services/stt.service.js';
import { createSubmission, getSubmissionHistory, checkDailyLimit, incrementTestCount } from '../../services/scoring.service.js';
import { markTopicUsed } from '../../services/topic.service.js';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const prisma = new PrismaClient();

router.use(devAuthMiddleware);

// Audio upload sozlash
const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../../uploads'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || '.ogg')}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/ogg', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/mp4', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.ogg') || file.originalname.endsWith('.oga')) {
      cb(null, true);
    } else {
      cb(new Error('Faqat audio formatlar qabul qilinadi'), false);
    }
  },
});

// =============================================
// POST /api/submissions/writing — Writing javob yuborish
// =============================================
router.post('/writing', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { topicId, content, subtype } = req.body;

    if (!content || content.trim().length < 20) {
      return res.status(400).json({ error: 'Javob juda qisqa (kamida 20 belgi)' });
    }

    // Kunlik limitni tekshirish
    const limit = await checkDailyLimit(user.id);
    if (!limit.allowed) {
      return res.status(429).json({
        error: 'Kunlik limit tugadi',
        message: `Bugungi bepul testlar tugadi. Ertaga qaytadan urinib ko'ring yoki premium obuna oling.`,
        remaining: 0,
      });
    }

    // Mavzuni olish
    let topic = null;
    if (topicId) {
      topic = await prisma.dailyTopic.findUnique({ where: { id: topicId } });
    }

    // AI baholash
    const feedback = await evaluateWriting({
      topicText: topic?.topicText || 'Free writing',
      answer: content,
      subtype: subtype || topic?.subtype || 'task2',
      levelSystem: user.levelSystem,
      language: user.language,
    });

    // Submission saqlash
    const submission = await createSubmission({
      userId: user.id,
      topicId: topic?.id || null,
      type: 'writing',
      subtype: subtype || topic?.subtype || 'task2',
      content,
      feedbackJson: feedback,
      bandScore: feedback.band_score,
      cefrLevel: feedback.cefr_level,
    });

    // Test countni oshirish va mavzuni belgilash
    await incrementTestCount(user.id);
    if (topic) {
      await markTopicUsed(user.id, topic.id);
    }

    res.json({
      submission: {
        ...submission,
        feedbackJson: feedback,
      },
      remaining: limit.remaining - 1,
    });
  } catch (error) {
    console.error('Writing submission error:', error);
    res.status(500).json({ error: 'Writing javobni baholashda xato yuz berdi' });
  }
});

// =============================================
// POST /api/submissions/speaking — Speaking (audio) javob yuborish
// =============================================
router.post('/speaking', telegramAuthMiddleware, resolveUserMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const user = req.user;
    const { topicId, subtype } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Audio fayl yuborilmadi' });
    }

    // Kunlik limitni tekshirish
    const limit = await checkDailyLimit(user.id);
    if (!limit.allowed) {
      return res.status(429).json({
        error: 'Kunlik limit tugadi',
        message: 'Bugungi bepul testlar tugadi.',
        remaining: 0,
      });
    }

    // Mavzuni olish
    let topic = null;
    if (topicId) {
      topic = await prisma.dailyTopic.findUnique({ where: { id: topicId } });
    }

    // Speech-to-text
    const transcript = await transcribeAudio(req.file.path);

    if (!transcript || transcript.trim().length < 5) {
      return res.status(400).json({
        error: 'Ovozli javob tanib olinmadi',
        message: 'Iltimos, aniqroq gapiring va qaytadan yuboring.',
      });
    }

    // AI baholash
    const feedback = await evaluateSpeaking({
      topicText: topic?.topicText || 'Free speaking',
      transcript,
      subtype: subtype || topic?.subtype || 'part2',
      levelSystem: user.levelSystem,
      language: user.language,
    });

    // Submission saqlash
    const audioUrl = `/uploads/${req.file.filename}`;
    const submission = await createSubmission({
      userId: user.id,
      topicId: topic?.id || null,
      type: 'speaking',
      subtype: subtype || topic?.subtype || 'part2',
      audioUrl,
      transcript,
      feedbackJson: feedback,
      bandScore: feedback.band_score,
      cefrLevel: feedback.cefr_level,
    });

    await incrementTestCount(user.id);
    if (topic) {
      await markTopicUsed(user.id, topic.id);
    }

    // Send voice and feedback to Telegram Bot if bot is running and user has telegramId
    const bot = req.app.get('bot');
    if (bot && user.telegramId) {
      try {
        const textTopic = topic?.topicText || 'Free practice';
        const formattedLvl = user.levelSystem === 'ielts' ? `Level: ${user.currentLevel}` : `CEFR: ${user.currentLevel}`;
        
        await bot.telegram.sendVoice(user.telegramId, { source: req.file.path }, {
          caption: `🎙 **Web App'dan yuborilgan Speaking javobi**\n\nMavzu: ${textTopic} (${formattedLvl})\n\n🤖 Ovoz tahlil qilinmoqda...`
        });

        const feedbackText = `📊 **Speaking Bahosi: ${feedback.band_score || 'N/A'} (CEFR: ${feedback.cefr_level || 'N/A'})**\n\n` +
          `🗣 **Fluency:** ${feedback.criteria?.fluency_coherence?.score || 'N/A'}/9\n` +
          `📚 **Vocabulary:** ${feedback.criteria?.lexical_resource?.score || 'N/A'}/9\n` +
          `✍️ **Grammar:** ${feedback.criteria?.grammar?.score || 'N/A'}/9\n` +
          `🔊 **Pronunciation:** ${feedback.criteria?.pronunciation?.score || 'N/A'}/9\n\n` +
          `👍 **Kuchli tomonlar:**\n${feedback.strengths?.map(s => `• ${s}`).join('\n') || 'N/A'}\n\n` +
          `❌ **Xatolar va tuzatishlar:**\n${feedback.errors?.map(e => `• original: *${e.original}*\n  tuzatish: *${e.correction}*\n  izoh: ${e.explanation}`).join('\n') || 'N/A'}\n\n` +
          `💡 **Tavsiyalar:**\n${feedback.recommendations?.map(r => `• ${r}`).join('\n') || 'N/A'}`;

        await bot.telegram.sendMessage(user.telegramId, feedbackText, { parse_mode: 'Markdown' })
          .catch(() => bot.telegram.sendMessage(user.telegramId, feedbackText.replace(/[*_]/g, '')));
      } catch (tgError) {
        console.error('Failed to send voice or feedback to Telegram bot:', tgError.message);
      }
    }

    res.json({
      submission: {
        ...submission,
        feedbackJson: feedback,
      },
      transcript,
      remaining: limit.remaining - 1,
    });
  } catch (error) {
    console.error('Speaking submission error:', error);
    res.status(500).json({ error: 'Speaking javobni baholashda xato yuz berdi' });
  }
});

// =============================================
// GET /api/submissions — Submission tarixini olish
// =============================================
router.get('/', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const history = await getSubmissionHistory(req.user.id, parseInt(page), parseInt(limit));
    res.json(history);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Tarixni olishda xato' });
  }
});

// =============================================
// GET /api/submissions/:id — Bitta submission olish
// =============================================
router.get('/:id', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    const submission = await prisma.submission.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        topic: { select: { topicText: true, subtype: true, type: true } },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission topilmadi' });
    }

    if (submission && submission.feedbackJson) {
      submission.feedbackJson = JSON.parse(submission.feedbackJson);
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Submission olishda xato' });
  }
});

export default router;
