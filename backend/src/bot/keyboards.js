/**
 * Telegram bot uchun inline klaviaturalar va tugmalar
 */
import { Markup } from 'telegraf';
import config from '../config/env.js';

// =============================================
// Asosiy menyular
// =============================================

export const mainMenuKeyboard = (language = 'uz') => {
  const texts = {
    uz: {
      test: '📝 Test topshirish',
      profile: '👤 Profil',
      progress: '📊 Progress',
      webapp: '🌐 To\'liq versiyani ochish',
      help: '❓ Yordam',
    },
    ru: {
      test: '📝 Пройти тест',
      profile: '👤 Профиль',
      progress: '📊 Прогресс',
      webapp: '🌐 Открыть полную версию',
      help: '❓ Помощь',
    },
    en: {
      test: '📝 Take a test',
      profile: '👤 Profile',
      progress: '📊 Progress',
      webapp: '🌐 Open full version',
      help: '❓ Help',
    },
  };

  const t = texts[language] || texts.uz;

  return Markup.inlineKeyboard([
    [Markup.button.callback(t.test, 'menu_test')],
    [Markup.button.callback(t.profile, 'menu_profile'), Markup.button.callback(t.progress, 'menu_progress')],
    [Markup.button.webApp(t.webapp, config.webAppUrl || 'https://example.com')],
    [Markup.button.callback(t.help, 'menu_help')],
  ]);
};

// =============================================
// Daraja tanlash
// =============================================

export const levelSystemKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🎯 IELTS (Band Score)', 'level_ielts')],
    [Markup.button.callback('🇪🇺 CEFR (A1-C2)', 'level_cefr')],
  ]);
};

export const ieltsLevelKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('4.0-4.5', 'ielts_4.0'),
      Markup.button.callback('5.0-5.5', 'ielts_5.0'),
      Markup.button.callback('6.0-6.5', 'ielts_6.0'),
    ],
    [
      Markup.button.callback('7.0-7.5', 'ielts_7.0'),
      Markup.button.callback('8.0+', 'ielts_8.0'),
    ],
  ]);
};

export const cefrLevelKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('A1 (Beginner)', 'cefr_A1'),
      Markup.button.callback('A2 (Elementary)', 'cefr_A2'),
    ],
    [
      Markup.button.callback('B1 (Intermediate)', 'cefr_B1'),
      Markup.button.callback('B2 (Upper-Inter.)', 'cefr_B2'),
    ],
    [
      Markup.button.callback('C1 (Advanced)', 'cefr_C1'),
      Markup.button.callback('C2 (Proficiency)', 'cefr_C2'),
    ],
  ]);
};

// =============================================
// Til tanlash
// =============================================

export const languageKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🇺🇿 O\'zbek tili', 'lang_uz')],
    [Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
    [Markup.button.callback('🇬🇧 English', 'lang_en')],
  ]);
};

// =============================================
// Test turi tanlash
// =============================================

export const testTypeKeyboard = (language = 'uz') => {
  const texts = {
    uz: { speaking: '🎙 Speaking', writing: '✍️ Writing' },
    ru: { speaking: '🎙 Speaking', writing: '✍️ Writing' },
    en: { speaking: '🎙 Speaking', writing: '✍️ Writing' },
  };

  const t = texts[language] || texts.uz;

  return Markup.inlineKeyboard([
    [Markup.button.callback(t.speaking, 'test_speaking')],
    [Markup.button.callback(t.writing, 'test_writing')],
  ]);
};

// =============================================
// Speaking part tanlash
// =============================================

export const speakingPartKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Part 1 (Umumiy savol)', 'speak_part1')],
    [Markup.button.callback('Part 2 (Cue Card)', 'speak_part2')],
    [Markup.button.callback('Part 3 (Chuqur savol)', 'speak_part3')],
  ]);
};

// =============================================
// Writing task tanlash
// =============================================

export const writingTaskKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Task 1 (Grafik/Diagramma)', 'write_task1')],
    [Markup.button.callback('Task 2 (Essay)', 'write_task2')],
  ]);
};

// =============================================
// Boshqa
// =============================================

export const cancelKeyboard = (language = 'uz') => {
  const texts = { uz: '❌ Bekor qilish', ru: '❌ Отменить', en: '❌ Cancel' };
  return Markup.inlineKeyboard([
    [Markup.button.callback(texts[language] || texts.uz, 'cancel')],
  ]);
};

export const tryAgainKeyboard = (language = 'uz') => {
  const texts = {
    uz: { again: '🔄 Yana test', menu: '🏠 Bosh menyu' },
    ru: { again: '🔄 Ещё тест', menu: '🏠 Главное меню' },
    en: { again: '🔄 Another test', menu: '🏠 Main menu' },
  };

  const t = texts[language] || texts.uz;

  return Markup.inlineKeyboard([
    [Markup.button.callback(t.again, 'menu_test')],
    [Markup.button.callback(t.menu, 'menu_main')],
  ]);
};

export default {
  mainMenuKeyboard,
  levelSystemKeyboard,
  ieltsLevelKeyboard,
  cefrLevelKeyboard,
  languageKeyboard,
  testTypeKeyboard,
  speakingPartKeyboard,
  writingTaskKeyboard,
  cancelKeyboard,
  tryAgainKeyboard,
};
