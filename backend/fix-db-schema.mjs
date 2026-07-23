import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  console.log('🔧 Updating topics table structure in Supabase...');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.topics 
    ADD COLUMN IF NOT EXISTS date_generated TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
  `);

  console.log('✅ Topics table updated successfully!');
}

fix()
  .catch((e) => console.error('Error:', e))
  .finally(() => prisma.$disconnect());
