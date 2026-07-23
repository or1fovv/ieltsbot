import { Router } from 'express';
import { telegramAuthMiddleware, resolveUserMiddleware, devAuthMiddleware } from '../middleware/auth.js';
import { getProgressStats, getLeaderboard } from '../../services/scoring.service.js';

const router = Router();

router.use(devAuthMiddleware);

// =============================================
// GET /api/progress — Progress statistika
// =============================================
router.get('/', telegramAuthMiddleware, resolveUserMiddleware, async (req, res) => {
  try {
    const stats = await getProgressStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Progress olishda xato' });
  }
});

// =============================================
// GET /api/progress/leaderboard — Reyting
// =============================================
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const leaderboard = await getLeaderboard(parseInt(limit));
    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Reyting olishda xato' });
  }
});

export default router;
