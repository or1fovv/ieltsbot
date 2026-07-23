import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { generateDailyTopics } from './topic.service.js';

const prisma = new PrismaClient();

/**
 * Kunlik mavzular generatsiyasi uchun cron job'larni ishga tushirish
 */
export function startScheduler(bot) {
  console.log('📅 Scheduler ishga tushdi');

  // Har kuni soat 00:00 da (UTC) yangi mavzular generatsiya qilish
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Kunlik mavzular generatsiyasi boshlandi...');
    await generateAllDailyTopics();
    console.log('✅ Kunlik mavzular generatsiyasi tugadi');
  });

  // Har kuni soat 08:00 da (Toshkent vaqti = 03:00 UTC) eslatma yuborish
  cron.schedule('0 3 * * *', async () => {
    if (bot) {
      await sendDailyReminders(bot);
    }
  });

  // Har kuni yarim tunda streak'larni tekshirish va reset qilish
  cron.schedule('5 0 * * *', async () => {
    await resetExpiredStreaks();
  });

  console.log('✅ Cron job\'lar sozlandi');
}

/**
 * Barcha darajalar va turlar uchun mavzular generatsiya qilish
 */
async function generateAllDailyTopics() {
  const levels = {
    ielts: ['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0'],
    cefr: ['A2', 'B1', 'B2', 'C1'],
  };

  const types = ['speaking', 'writing'];

  for (const [system, systemLevels] of Object.entries(levels)) {
    for (const level of systemLevels) {
      for (const type of types) {
        try {
          await generateDailyTopics(system, level, type);
          console.log(`  ✅ ${system} ${level} ${type} — mavzular yaratildi`);
          // Rate limiting uchun kichik kutish
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`  ❌ ${system} ${level} ${type} — xato:`, error.message);
        }
      }
    }
  }
}

/**
 * Kunlik eslatma yuborish (test topshirmagan foydalanuvchilarga)
 * @param {import('telegraf').Telegraf} bot
 */
async function sendDailyReminders(bot) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Bugun test topshirmagan foydalanuvchilarni topish
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { lastTestDate: null },
        { lastTestDate: { lt: today } },
      ],
    },
    select: { telegramId: true, firstName: true, language: true },
  });

  const messages = {
    uz: (name) => `🌅 Assalomu alaykum, ${name}!\n\n📝 Bugungi IELTS/CEFR testingiz tayyor! Streak'ingizni yo'qotmang — hoziroq test topshiring.\n\n/test — Testni boshlash`,
    ru: (name) => `🌅 Доброе утро, ${name}!\n\n📝 Ваш ежедневный тест IELTS/CEFR готов! Не теряйте свой стрик — пройдите тест прямо сейчас.\n\n/test — Начать тест`,
    en: (name) => `🌅 Good morning, ${name}!\n\n📝 Your daily IELTS/CEFR test is ready! Don't lose your streak — take the test now.\n\n/test — Start test`,
  };

  let sent = 0;
  for (const user of users) {
    try {
      const lang = user.language || 'uz';
      const msgFn = messages[lang] || messages.uz;
      await bot.telegram.sendMessage(
        user.telegramId.toString(),
        msgFn(user.firstName)
      );
      sent++;
      // Telegram rate limit uchun
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Foydalanuvchi botni bloklagan bo'lishi mumkin
      if (error.code !== 403) {
        console.error(`Reminder error for ${user.telegramId}:`, error.message);
      }
    }
  }

  console.log(`📬 ${sent}/${users.length} foydalanuvchiga eslatma yuborildi`);
}

/**
 * Muddati o'tgan streak'larni reset qilish
 */
async function resetExpiredStreaks() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const result = await prisma.progressStats.updateMany({
    where: {
      streak: { gt: 0 },
      lastTestDate: { lt: yesterday },
    },
    data: { streak: 0 },
  });

  console.log(`🔄 ${result.count} ta streak reset qilindi`);
}

export default { startScheduler };
