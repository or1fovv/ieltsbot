/**
 * Supabase database schema initialization
 *
 * Run this file in the Supabase SQL editor for a fresh database.
 * It mirrors backend/prisma/schema.prisma, so Prisma can read/write these tables.
 */

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  username TEXT,
  level_system TEXT NOT NULL DEFAULT 'ielts',
  current_level TEXT NOT NULL DEFAULT '5.0',
  language TEXT NOT NULL DEFAULT 'uz',
  timezone TEXT NOT NULL DEFAULT 'Asia/Tashkent',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  tests_today INTEGER NOT NULL DEFAULT 0,
  last_test_date TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.daily_topics (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  subtype TEXT NOT NULL,
  level_system TEXT NOT NULL,
  level TEXT NOT NULL,
  topic_text TEXT NOT NULL,
  topic_data TEXT,
  date_generated TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES public.daily_topics(id),
  type TEXT NOT NULL,
  subtype TEXT,
  content TEXT,
  audio_url TEXT,
  transcript TEXT,
  feedback_json TEXT,
  band_score DOUBLE PRECISION,
  cefr_level TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.progress_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_tests INTEGER NOT NULL DEFAULT 0,
  total_speaking INTEGER NOT NULL DEFAULT 0,
  total_writing INTEGER NOT NULL DEFAULT 0,
  avg_speaking_score DOUBLE PRECISION,
  avg_writing_score DOUBLE PRECISION,
  last_test_date TIMESTAMP(3),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.used_topics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES public.daily_topics(id) ON DELETE CASCADE,
  used_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT used_topics_user_id_topic_id_key UNIQUE (user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS daily_topics_type_level_system_level_date_generated_idx
  ON public.daily_topics(type, level_system, level, date_generated);
CREATE INDEX IF NOT EXISTS submissions_user_id_created_at_idx
  ON public.submissions(user_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;
