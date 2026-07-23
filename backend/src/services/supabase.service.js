import { createClient } from '@supabase/supabase-js';
import config from '../config/env.js';

// Supabase client yaratish
const supabaseUrl = process.env.SUPABASE_URL || config.supabaseUrl;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabaseServiceRoleKey;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Foydalanuvchining Telegram ID orqali Supabase dagi ID ni topish
 * @param {number} telegramId
 * @returns {Promise<string|null>}
 */
export async function getUserIdByTelegramId(telegramId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single();

    if (error) return null;
    return data?.id;
  } catch {
    return null;
  }
}

/**
 * Audio faylni Supabase Storage ga yuklash
 * @param {string} filePath - Local fayl yo'li
 * @param {string} fileName - Storage dagi fayl nomi
 * @returns {Promise<string|null>} - Public URL yoki null
 */
export async function uploadAudioToStorage(filePath, fileName) {
  try {
    const fs = (await import('fs')).default;
    const fileBuffer = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, fileBuffer, {
        contentType: 'audio/ogg',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    // Public URL olish
    const { data: publicData } = supabase.storage
      .from('audio')
      .getPublicUrl(data.path);

    return publicData?.publicUrl;
  } catch (error) {
    console.error('Audio upload error:', error);
    return null;
  }
}

/**
 * Supabase bilan bog'lanishni tekshirish
 */
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

export default {
  supabase,
  getUserIdByTelegramId,
  uploadAudioToStorage,
  checkSupabaseConnection,
};
