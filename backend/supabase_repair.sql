/**
 * Repair SQL for databases initialized with the old backend/supabase_schema.sql.
 *
 * Run this in the Supabase SQL editor if you already created the old UUID/topics
 * tables. It converts the tables to the shape expected by Prisma without dropping
 * existing rows.
 */

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE IF EXISTS public.submissions DROP CONSTRAINT IF EXISTS submissions_topic_id_fkey;
ALTER TABLE IF EXISTS public.submissions DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;
ALTER TABLE IF EXISTS public.progress_stats DROP CONSTRAINT IF EXISTS progress_stats_user_id_fkey;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'topics'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'daily_topics'
  ) THEN
    ALTER TABLE public.topics RENAME TO daily_topics;
  END IF;
END $$;

ALTER TABLE IF EXISTS public.users
  ALTER COLUMN id TYPE TEXT USING id::text,
  ALTER COLUMN level_system SET DEFAULT 'ielts',
  ALTER COLUMN current_level SET DEFAULT '5.0',
  ALTER COLUMN language SET DEFAULT 'uz';

UPDATE public.users
SET first_name = 'Foydalanuvchi'
WHERE first_name IS NULL;

ALTER TABLE IF EXISTS public.users
  ALTER COLUMN first_name SET NOT NULL;

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Tashkent',
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tests_today INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_test_date TIMESTAMP(3);

ALTER TABLE IF EXISTS public.daily_topics
  ALTER COLUMN id TYPE TEXT USING id::text,
  ALTER COLUMN topic_data TYPE TEXT USING topic_data::text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_topics' AND column_name = 'current_level'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_topics' AND column_name = 'level'
  ) THEN
    ALTER TABLE public.daily_topics RENAME COLUMN current_level TO level;
  END IF;
END $$;

ALTER TABLE IF EXISTS public.daily_topics
  ADD COLUMN IF NOT EXISTS date_generated TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE IF EXISTS public.progress_stats
  ALTER COLUMN id TYPE TEXT USING id::text,
  ALTER COLUMN user_id TYPE TEXT USING user_id::text,
  ALTER COLUMN avg_speaking_score TYPE DOUBLE PRECISION,
  ALTER COLUMN avg_writing_score TYPE DOUBLE PRECISION;

ALTER TABLE IF EXISTS public.submissions
  ALTER COLUMN id TYPE TEXT USING id::text,
  ALTER COLUMN user_id TYPE TEXT USING user_id::text,
  ALTER COLUMN topic_id TYPE TEXT USING topic_id::text,
  ALTER COLUMN feedback_json TYPE TEXT USING feedback_json::text,
  ALTER COLUMN band_score TYPE DOUBLE PRECISION;

ALTER TABLE IF EXISTS public.submissions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed';

CREATE TABLE IF NOT EXISTS public.used_topics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  used_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT used_topics_user_id_topic_id_key UNIQUE (user_id, topic_id)
);

ALTER TABLE IF EXISTS public.progress_stats
  ADD CONSTRAINT progress_stats_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.submissions
  ADD CONSTRAINT submissions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.submissions
  ADD CONSTRAINT submissions_topic_id_fkey
  FOREIGN KEY (topic_id) REFERENCES public.daily_topics(id);

ALTER TABLE IF EXISTS public.used_topics
  ADD CONSTRAINT used_topics_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.used_topics
  ADD CONSTRAINT used_topics_topic_id_fkey
  FOREIGN KEY (topic_id) REFERENCES public.daily_topics(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS daily_topics_type_level_system_level_date_generated_idx
  ON public.daily_topics(type, level_system, level, date_generated);
CREATE INDEX IF NOT EXISTS submissions_user_id_created_at_idx
  ON public.submissions(user_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;
