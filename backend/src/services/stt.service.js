import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import config from '../config/env.js';

const groq = new Groq({ apiKey: config.groqApiKey });

/**
 * Audio faylni matnga o'girish — Groq Whisper (bepul)
 * @param {string} filePath - audio fayl yo'li
 * @returns {Promise<string>} transkriptsiya
 */
export async function transcribeAudio(filePath) {
  try {
    const fileStream = fs.createReadStream(filePath);

    const transcription = await groq.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-large-v3-turbo', // Tez va aniq
      language: 'en',
      response_format: 'text',
    });

    if (!transcription || transcription.trim().length < 2) {
      throw new Error('Transkriptsiya bo\'sh qaytdi');
    }

    return transcription.trim();
  } catch (error) {
    console.error('STT (Groq Whisper) error:', error);
    throw new Error(`Ovozni matnga o'girishda xato: ${error.message}`);
  }
}

/**
 * Audio fayl hajmini tekshirish (max 25MB — Groq limiti)
 * @param {string} filePath
 * @returns {boolean}
 */
export function validateAudioFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const maxSize = 25 * 1024 * 1024; // 25MB
    return stats.size <= maxSize;
  } catch {
    return false;
  }
}

export default {
  transcribeAudio,
  validateAudioFile,
};
