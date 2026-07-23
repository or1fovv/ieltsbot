import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Submission yaratish va progress yangilash
 * @param {Object} params
 * @returns {Promise<Object>} yangilangan submission
 */
export async function createSubmission({ userId, topicId, type, subtype, content, audioUrl, transcript, feedbackJson, bandScore, cefrLevel }) {
  // Submission yaratish
  const submission = await prisma.submission.create({
    data: {
      userId,
      topicId,
      type,
      subtype,
      content,
      audioUrl,
      transcript,
      feedbackJson: feedbackJson ? JSON.stringify(feedbackJson) : null,
      bandScore,
      cefrLevel,
      status: 'completed',
    },
  });

  // Progress yangilash
  await updateProgress(userId, type, bandScore);

  return submission;
}

/**
 * Submission statusini yangilash
 * @param {number} submissionId
 * @param {string} status
 * @param {Object} data - qo'shimcha ma'lumotlar
 */
export async function updateSubmissionStatus(submissionId, status, data = {}) {
  return prisma.submission.update({
    where: { id: submissionId },
    data: { status, ...data },
  });
}

/**
 * Progress statistikasini yangilash
 * @param {number} userId
 * @param {string} type - "speaking" yoki "writing"
 * @param {number} score - band score
 */
async function updateProgress(userId, type, score) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mavjud progress olish yoki yaratish
  let stats = await prisma.progressStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    stats = await prisma.progressStats.create({
      data: {
        userId,
        streak: 1,
        longestStreak: 1,
        totalTests: 1,
        totalSpeaking: type === 'speaking' ? 1 : 0,
        totalWriting: type === 'writing' ? 1 : 0,
        avgSpeakingScore: type === 'speaking' ? score : null,
        avgWritingScore: type === 'writing' ? score : null,
        lastTestDate: today,
      },
    });
    return stats;
  }

  // Streak hisoblash
  let newStreak = stats.streak;
  const lastTest = stats.lastTestDate ? new Date(stats.lastTestDate) : null;

  if (lastTest) {
    lastTest.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Ketma-ket kun — streak davom etadi
      newStreak = stats.streak + 1;
    } else if (diffDays === 0) {
      // Bir xil kun — streak o'zgarmaydi
      newStreak = stats.streak;
    } else {
      // Oraliq bor — streak qaytadan boshlanadi
      newStreak = 1;
    }
  }

  // O'rtacha ballni yangilash
  const totalType = type === 'speaking' ? stats.totalSpeaking : stats.totalWriting;
  const avgType = type === 'speaking' ? stats.avgSpeakingScore : stats.avgWritingScore;
  const newAvg = avgType ? ((avgType * totalType) + score) / (totalType + 1) : score;

  const updateData = {
    streak: newStreak,
    longestStreak: Math.max(stats.longestStreak, newStreak),
    totalTests: stats.totalTests + 1,
    lastTestDate: today,
  };

  if (type === 'speaking') {
    updateData.totalSpeaking = stats.totalSpeaking + 1;
    updateData.avgSpeakingScore = Math.round(newAvg * 10) / 10;
  } else {
    updateData.totalWriting = stats.totalWriting + 1;
    updateData.avgWritingScore = Math.round(newAvg * 10) / 10;
  }

  return prisma.progressStats.update({
    where: { userId },
    data: updateData,
  });
}

/**
 * Foydalanuvchi progress statistikasini olish
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export async function getProgressStats(userId) {
  let stats = await prisma.progressStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    stats = {
      streak: 0,
      longestStreak: 0,
      totalTests: 0,
      totalSpeaking: 0,
      totalWriting: 0,
      avgSpeakingScore: null,
      avgWritingScore: null,
      lastTestDate: null,
    };
  }

  // Oxirgi 30 kunlik submission'lar (grafik uchun)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSubmissions = await prisma.submission.findMany({
    where: {
      userId,
      status: 'completed',
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      id: true,
      type: true,
      bandScore: true,
      cefrLevel: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return {
    ...stats,
    recentSubmissions,
  };
}

/**
 * Foydalanuvchi submission tarixini olish
 * @param {number} userId
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export async function getSubmissionHistory(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where: { userId, status: 'completed' },
      include: {
        topic: {
          select: { topicText: true, subtype: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.submission.count({
      where: { userId, status: 'completed' },
    }),
  ]);

  return {
    submissions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Leaderboard (top foydalanuvchilar)
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getLeaderboard(limit = 20) {
  const stats = await prisma.progressStats.findMany({
    where: { totalTests: { gt: 0 } },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
          currentLevel: true,
        },
      },
    },
    orderBy: [
      { streak: 'desc' },
      { totalTests: 'desc' },
    ],
    take: limit,
  });

  return stats.map((s, i) => ({
    rank: i + 1,
    name: s.user.firstName + (s.user.lastName ? ` ${s.user.lastName}` : ''),
    username: s.user.username,
    level: s.user.currentLevel,
    streak: s.streak,
    totalTests: s.totalTests,
    avgScore: s.avgSpeakingScore || s.avgWritingScore || 0,
  }));
}

/**
 * Kunlik test limitni tekshirish va yangilash
 * @param {number} userId
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
export async function checkDailyLimit(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, remaining: 0 };

  // Premium foydalanuvchilarga limit yo'q
  if (user.isPremium) return { allowed: true, remaining: 999 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = user.lastTestDate ? new Date(user.lastTestDate) : null;
  let testsToday = user.testsToday;

  // Agar oxirgi test boshqa kunda bo'lsa — countni reset qilish
  if (!lastDate || lastDate.getTime() < today.getTime()) {
    testsToday = 0;
    await prisma.user.update({
      where: { id: userId },
      data: { testsToday: 0, lastTestDate: today },
    });
  }

  const FREE_LIMIT = 3;
  const remaining = Math.max(0, FREE_LIMIT - testsToday);

  return {
    allowed: testsToday < FREE_LIMIT,
    remaining,
  };
}

/**
 * Kunlik test countni oshirish
 * @param {number} userId
 */
export async function incrementTestCount(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      testsToday: { increment: 1 },
      lastTestDate: new Date(),
    },
  });
}

export default {
  createSubmission,
  updateSubmissionStatus,
  getProgressStats,
  getSubmissionHistory,
  getLeaderboard,
  checkDailyLimit,
  incrementTestCount,
};
