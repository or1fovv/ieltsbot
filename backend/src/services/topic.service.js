import { PrismaClient } from '@prisma/client';
import { generateTopic } from './ai.service.js';

const prisma = new PrismaClient();

/**
 * Bugungi mavzularni olish yoki generatsiya qilish
 * @param {string} levelSystem - "ielts" yoki "cefr"
 * @param {string} level - daraja
 * @param {string} type - "speaking" yoki "writing"
 * @returns {Promise<Array>} mavzular ro'yxati
 */
export async function getTodayTopics(levelSystem, level, type) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Bugungi mavzularni qidirish
  let topics = await prisma.dailyTopic.findMany({
    where: {
      type,
      levelSystem,
      level,
      isActive: true,
      dateGenerated: {
        gte: today,
        lt: tomorrow,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Agar bugungi mavzular bo'lmasa, baza ichidagi barcha mos aktiv mavzularni izlash
  if (topics.length === 0) {
    topics = await prisma.dailyTopic.findMany({
      where: {
        type,
        levelSystem,
        level,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. Hali ham bo'lsa — AI bilan yangi generatsiya qilish
  if (topics.length === 0) {
    topics = await generateDailyTopics(levelSystem, level, type);
  }

  // Safe topicData parsing
  return topics.map(t => ({
    ...t,
    topicData: typeof t.topicData === 'string' ? JSON.parse(t.topicData) : (t.topicData || null)
  }));
}

/**
 * Kunlik mavzularni generatsiya qilish
 * @param {string} levelSystem
 * @param {string} level
 * @param {string} type
 * @returns {Promise<Array>} yangi mavzular
 */
export async function generateDailyTopics(levelSystem, level, type) {
  const subtypes = type === 'speaking'
    ? ['part1', 'part2', 'part3']
    : ['task1', 'task2'];

  // Oldin ishlatilgan mavzularni olish
  const usedTopics = await prisma.dailyTopic.findMany({
    where: { type, levelSystem, level },
    select: { topicText: true },
    orderBy: { createdAt: 'desc' },
    take: 50, // oxirgi 50 ta mavzuni tekshirish
  });

  const usedTexts = usedTopics.map(t => t.topicText);
  const newTopics = [];

  for (const subtype of subtypes) {
    try {
      const topicData = await generateTopic({
        type,
        subtype,
        levelSystem,
        level,
        usedTopics: usedTexts,
      });

      const topic = await prisma.dailyTopic.create({
        data: {
          type,
          subtype,
          levelSystem,
          level,
          topicText: topicData.topic_text,
          topicData: topicData ? JSON.stringify(topicData) : null,
          isActive: true,
        },
      });

      newTopics.push(topic);
    } catch (error) {
      console.error(`Topic generation failed for ${type}/${subtype}:`, error);
    }
  }

  return newTopics;
}

/**
 * Mavzuni ishlatilgan deb belgilash (foydalanuvchi uchun)
 * @param {number} userId
 * @param {number} topicId
 */
export async function markTopicUsed(userId, topicId) {
  await prisma.usedTopic.upsert({
    where: {
      userId_topicId: { userId, topicId },
    },
    create: { userId, topicId },
    update: {},
  });
}

/**
 * Foydalanuvchi uchun ishlatilmagan mavzu olish
 * @param {number} userId
 * @param {string} type
 * @param {string} levelSystem
 * @param {string} level
 * @returns {Promise<Object|null>} mavzu
 */
export async function getUnusedTopicForUser(userId, type, levelSystem, level) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Bugungi mavzulardan ishlatilmaganini topish
  const topic = await prisma.dailyTopic.findFirst({
    where: {
      type,
      levelSystem,
      level,
      isActive: true,
      dateGenerated: {
        gte: today,
        lt: tomorrow,
      },
      usedByUsers: {
        none: { userId },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (topic && topic.topicData && typeof topic.topicData === 'string') {
    topic.topicData = JSON.parse(topic.topicData);
  }

  return topic;
}

export default {
  getTodayTopics,
  generateDailyTopics,
  markTopicUsed,
  getUnusedTopicForUser,
};
