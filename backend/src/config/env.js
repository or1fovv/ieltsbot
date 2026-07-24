import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const config = {
  // Telegram
  botToken: process.env.TELEGRAM_BOT_TOKEN,

  // AI API - Groq (bepul)
  groqApiKey: process.env.GROQ_API_KEY,

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'https://ieltsbot-bay.vercel.app',
  webAppUrl: process.env.WEB_APP_URL || 'https://ieltsbot-bay.vercel.app',

  // Limits
  freeTestsPerDay: 3,
  diagnosticQuestionCount: 5,
};

// Validate required env vars
const required = ['botToken', 'groqApiKey', 'databaseUrl', 'supabaseUrl'];
for (const key of required) {
  if (!config[key]) {
    console.warn(`⚠️  Warning: ${key} is not set in environment variables`);
  }
}

export default config;
