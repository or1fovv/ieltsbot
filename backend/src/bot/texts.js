/**
 * Botdagi matnlar — ko'p tilli (uz, ru, en)
 */
const texts = {
  uz: {
    welcome: (name) => `🎓 Assalomu alaykum, ${name}!

**IELTS & CEFR Speaking/Writing Trainer** botiga xush kelibsiz!

Bu bot orqali siz:
📝 Har kuni yangi Speaking va Writing testlar olasiz
🤖 AI orqali professional feedback olasiz
📊 Progress'ingizni kuzatasiz
🔥 Streak tizimi bilan motivatsiya saqlanadi

Boshlaymizmi? Avval interfeys tilini tanlang:`,

    chooseLevelSystem: 'Qaysi tizimda o\'qimoqchisiz?',
    chooseLevel: 'Joriy darajangizni tanlang:',
    registrationComplete: (level) => `✅ Ro'yxatdan o'tdingiz!

📊 Joriy darajangiz: **${level}**

Endi testni boshlash uchun /test buyrug'ini yuboring yoki quyidagi tugmalardan foydalaning:`,

    chooseTestType: '📝 Qaysi bo\'limni topshirmoqchisiz?',
    chooseSpeakingPart: '🎙 Speaking qaysi Part ni topshirasiz?',
    chooseWritingTask: '✍️ Writing qaysi Task ni topshirasiz?',

    topicReady: (topic) => `📋 **Mavzu tayyor!**

${topic}

⏱ Javobingizni yuboring:
🎙 Speaking — ovozli xabar yuboring
✍️ Writing — matn yozing va yuboring`,

    processing: '⏳ Javobingiz tahlil qilinmoqda... Biroz kuting.',
    processingAudio: '🎙 Ovoz tanib olinmoqda va tahlil qilinmoqda...',

    resultHeader: (score, cefr) => `📊 **Natija: Band ${score}** (CEFR ${cefr})`,

    profileInfo: (user, stats) => `👤 **Profil**

📛 Ism: ${user.firstName}
📊 Tizim: ${user.levelSystem.toUpperCase()}
🎯 Daraja: ${user.currentLevel}
🌐 Til: ${user.language === 'uz' ? "O'zbek" : user.language === 'ru' ? 'Русский' : 'English'}

📈 **Statistika:**
🔥 Streak: ${stats?.streak || 0} kun
📝 Jami testlar: ${stats?.totalTests || 0}
🎙 Speaking o'rtacha: ${stats?.avgSpeakingScore || '—'}
✍️ Writing o'rtacha: ${stats?.avgWritingScore || '—'}`,

    progressInfo: (stats) => `📊 **Progress**

🔥 Joriy streak: **${stats?.streak || 0}** kun
🏆 Eng uzun streak: **${stats?.longestStreak || 0}** kun
📝 Jami testlar: **${stats?.totalTests || 0}**
🎙 Speaking: **${stats?.totalSpeaking || 0}** ta (o'rtacha: ${stats?.avgSpeakingScore || '—'})
✍️ Writing: **${stats?.totalWriting || 0}** ta (o'rtacha: ${stats?.avgWritingScore || '—'})

Batafsil statistikani saytda ko'ring 👇`,

    helpText: `❓ **Yordam**

🤖 Bu bot IELTS va CEFR bo'yicha Speaking va Writing mashq qilish uchun.

📌 **Buyruqlar:**
/start — Qaytadan boshlash
/test — Test topshirish
/profile — Profil ko'rish
/progress — Progress statistika
/help — Yordam

📝 **Qanday ishlaydi:**
1. /test buyrug'ini bosing
2. Speaking yoki Writing tanlang
3. Mavzu keladi — javobingizni yuboring
4. AI tahlil qilib natija beradi

🎙 **Speaking:** Ovozli xabar yuboring
✍️ **Writing:** Matn yozing va yuboring

💡 Har kuni yangi mavzular! Streak'ingizni yo'qotmang!`,

    limitReached: '⚠️ Bugungi bepul testlar tugadi (3/3). Ertaga qaytadan urinib ko\'ring yoki premium obuna oling!',
    error: '❌ Xato yuz berdi. Iltimos, qaytadan urinib ko\'ring.',
    cancelled: '❌ Bekor qilindi.',
    audioTooShort: '⚠️ Ovozli xabar juda qisqa. Iltimos, kamida 10 soniya gapiring.',
    textTooShort: '⚠️ Javob juda qisqa. Iltimos, kamida bir necha jumla yozing.',
    noActiveTest: '⚠️ Hozirda faol test yo\'q. Avval /test buyrug\'ini bosing.',
  },

  ru: {
    welcome: (name) => `🎓 Здравствуйте, ${name}!

Добро пожаловать в бот **IELTS & CEFR Speaking/Writing Trainer**!

С помощью этого бота вы:
📝 Получаете новые тесты Speaking и Writing каждый день
🤖 Получаете профессиональный AI-фидбек
📊 Отслеживаете свой прогресс
🔥 Поддерживаете мотивацию с системой стриков

Начнём? Сначала выберите язык интерфейса:`,

    chooseLevelSystem: 'По какой системе хотите заниматься?',
    chooseLevel: 'Выберите ваш текущий уровень:',
    registrationComplete: (level) => `✅ Вы зарегистрированы!

📊 Ваш текущий уровень: **${level}**

Для начала теста используйте /test или кнопки ниже:`,

    chooseTestType: '📝 Какой раздел хотите пройти?',
    chooseSpeakingPart: '🎙 Какой Part хотите пройти?',
    chooseWritingTask: '✍️ Какой Task хотите пройти?',
    topicReady: (topic) => `📋 **Тема готова!**\n\n${topic}\n\n⏱ Отправьте ваш ответ:\n🎙 Speaking — отправьте голосовое сообщение\n✍️ Writing — напишите текст`,
    processing: '⏳ Ваш ответ анализируется... Подождите немного.',
    processingAudio: '🎙 Распознавание и анализ голоса...',
    resultHeader: (score, cefr) => `📊 **Результат: Band ${score}** (CEFR ${cefr})`,
    profileInfo: (user, stats) => `👤 **Профиль**\n\n📛 Имя: ${user.firstName}\n📊 Система: ${user.levelSystem.toUpperCase()}\n🎯 Уровень: ${user.currentLevel}\n\n📈 **Статистика:**\n🔥 Стрик: ${stats?.streak || 0} дней\n📝 Всего тестов: ${stats?.totalTests || 0}\n🎙 Speaking среднее: ${stats?.avgSpeakingScore || '—'}\n✍️ Writing среднее: ${stats?.avgWritingScore || '—'}`,
    progressInfo: (stats) => `📊 **Прогресс**\n\n🔥 Текущий стрик: **${stats?.streak || 0}** дней\n🏆 Лучший стрик: **${stats?.longestStreak || 0}** дней\n📝 Всего тестов: **${stats?.totalTests || 0}**`,
    helpText: `❓ **Помощь**\n\n/start — Начать заново\n/test — Пройти тест\n/profile — Профиль\n/progress — Статистика\n/help — Помощь`,
    limitReached: '⚠️ Лимит бесплатных тестов на сегодня исчерпан (3/3).',
    error: '❌ Произошла ошибка. Попробуйте снова.',
    cancelled: '❌ Отменено.',
    audioTooShort: '⚠️ Голосовое сообщение слишком короткое.',
    textTooShort: '⚠️ Ответ слишком короткий.',
    noActiveTest: '⚠️ Нет активного теста. Используйте /test.',
    chooseTestType: '📝 Какой раздел?',
  },

  en: {
    welcome: (name) => `🎓 Hello, ${name}!

Welcome to **IELTS & CEFR Speaking/Writing Trainer** bot!

With this bot you can:
📝 Get new Speaking and Writing tests daily
🤖 Receive professional AI feedback
📊 Track your progress
🔥 Stay motivated with the streak system

Let's begin? First, choose your interface language:`,

    chooseLevelSystem: 'Which system would you like to study?',
    chooseLevel: 'Choose your current level:',
    registrationComplete: (level) => `✅ You're registered!\n\n📊 Your current level: **${level}**\n\nUse /test or buttons below to start:`,
    chooseTestType: '📝 Which section would you like to take?',
    chooseSpeakingPart: '🎙 Which Part would you like to take?',
    chooseWritingTask: '✍️ Which Task would you like to take?',
    topicReady: (topic) => `📋 **Topic ready!**\n\n${topic}\n\n⏱ Send your answer:\n🎙 Speaking — send a voice message\n✍️ Writing — type your text`,
    processing: '⏳ Analyzing your answer... Please wait.',
    processingAudio: '🎙 Recognizing and analyzing voice...',
    resultHeader: (score, cefr) => `📊 **Result: Band ${score}** (CEFR ${cefr})`,
    profileInfo: (user, stats) => `👤 **Profile**\n\n📛 Name: ${user.firstName}\n📊 System: ${user.levelSystem.toUpperCase()}\n🎯 Level: ${user.currentLevel}\n\n📈 **Stats:**\n🔥 Streak: ${stats?.streak || 0} days\n📝 Total tests: ${stats?.totalTests || 0}\n🎙 Speaking avg: ${stats?.avgSpeakingScore || '—'}\n✍️ Writing avg: ${stats?.avgWritingScore || '—'}`,
    progressInfo: (stats) => `📊 **Progress**\n\n🔥 Current streak: **${stats?.streak || 0}** days\n🏆 Best streak: **${stats?.longestStreak || 0}** days\n📝 Total tests: **${stats?.totalTests || 0}**`,
    helpText: `❓ **Help**\n\n/start — Restart\n/test — Take a test\n/profile — Profile\n/progress — Statistics\n/help — Help`,
    limitReached: '⚠️ Daily free tests limit reached (3/3).',
    error: '❌ An error occurred. Please try again.',
    cancelled: '❌ Cancelled.',
    audioTooShort: '⚠️ Voice message too short.',
    textTooShort: '⚠️ Answer too short.',
    noActiveTest: '⚠️ No active test. Use /test first.',
  },
};

/**
 * Foydalanuvchi tiliga mos matnni olish
 * @param {string} language - "uz", "ru", "en"
 * @returns {Object} tilga mos matnlar
 */
export function getTexts(language = 'uz') {
  return texts[language] || texts.uz;
}

/**
 * AI natijani chiroyli formatda ko'rsatish
 */
export function formatFeedback(feedback, type, language = 'uz') {
  const isSpeaking = type === 'speaking';

  let result = '';

  // Header
  result += `📊 **Natija: Band ${feedback.band_score}** (CEFR ${feedback.cefr_level})\n\n`;

  // Criteria breakdown
  result += `📋 **Mezonlar:**\n`;
  const criteria = feedback.criteria;

  if (isSpeaking) {
    result += formatCriteria('Fluency & Coherence', criteria.fluency_coherence);
    result += formatCriteria('Lexical Resource', criteria.lexical_resource);
    result += formatCriteria('Grammar', criteria.grammar);
    result += formatCriteria('Pronunciation', criteria.pronunciation);
  } else {
    result += formatCriteria('Task Achievement', criteria.task_achievement);
    result += formatCriteria('Coherence & Cohesion', criteria.coherence_cohesion);
    result += formatCriteria('Lexical Resource', criteria.lexical_resource);
    result += formatCriteria('Grammar', criteria.grammar);
  }

  // Strengths
  if (feedback.strengths && feedback.strengths.length > 0) {
    result += `\n💪 **Kuchli tomonlar:**\n`;
    feedback.strengths.forEach(s => {
      result += `• ${s}\n`;
    });
  }

  // Errors
  if (feedback.errors && feedback.errors.length > 0) {
    result += `\n❌ **Xatolar:**\n`;
    feedback.errors.slice(0, 5).forEach(e => {
      result += `• "${e.original}" → "${e.correction}"\n  _${e.explanation}_\n`;
    });
  }

  // Recommendations
  if (feedback.recommendations && feedback.recommendations.length > 0) {
    result += `\n📌 **Tavsiyalar:**\n`;
    feedback.recommendations.forEach((r, i) => {
      result += `${i + 1}. ${r}\n`;
    });
  }

  return result;
}

function formatCriteria(name, criteria) {
  if (!criteria) return '';
  const emoji = criteria.score >= 7 ? '✅' : criteria.score >= 5.5 ? '⚠️' : '❌';
  return `${emoji} ${name}: **${criteria.score}** — ${criteria.comment}\n`;
}

export default { getTexts, formatFeedback };
