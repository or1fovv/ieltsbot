import { Router } from 'express';
import { telegramAuthMiddleware, resolveUserMiddleware, devAuthMiddleware } from '../middleware/auth.js';
import { getTodayTopics, getUnusedTopicForUser } from '../../services/topic.service.js';

const router = Router();

router.use(devAuthMiddleware);

// =============================================
// GET /api/topics/today — Bugungi mavzular
// =============================================
router.get('/today', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { type } = req.query; // "speaking" yoki "writing" (ixtiyoriy)

    if (type && !['speaking', 'writing'].includes(type)) {
      return res.status(400).json({ error: 'Noto\'g\'ri tur. "speaking" yoki "writing" bo\'lishi kerak.' });
    }

    const types = type ? [type] : ['speaking', 'writing'];
    const topics = {};

    for (const t of types) {
      topics[t] = await getTodayTopics(user.levelSystem, user.currentLevel, t);
    }

    res.json({ topics });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ error: 'Mavzularni olishda xato' });
  }
});

// =============================================
// GET /api/topics/next — Keyingi ishlatilmagan mavzu
// =============================================
router.get('/next', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { type } = req.query;

    if (!type || !['speaking', 'writing'].includes(type)) {
      return res.status(400).json({ error: '"type" parametri talab qilinadi: "speaking" yoki "writing"' });
    }

    let topic = await getUnusedTopicForUser(user.id, type, user.levelSystem, user.currentLevel);

    // Agar bugungi mavzu yo'q bo'lsa, yangi generatsiya qilish
    if (!topic) {
      await getTodayTopics(user.levelSystem, user.currentLevel, type);
      topic = await getUnusedTopicForUser(user.id, type, user.levelSystem, user.currentLevel);
    }

    if (!topic) {
      return res.status(404).json({
        error: 'Bugungi barcha mavzular topshirilgan',
        message: 'Ertaga yangi mavzular bo\'ladi!',
      });
    }

    res.json({ topic });
  } catch (error) {
    console.error('Get next topic error:', error);
    res.status(500).json({ error: 'Mavzu olishda xato' });
  }
});

export default router;
