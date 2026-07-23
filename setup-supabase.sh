#!/bin/bash

# 🔐 Supabase Integration Complete Setup Script
# Bu script barcha kerakli sozlamalarni avtomatik qiladi

echo "🚀 IELTS Bot — Supabase Integration Setup"
echo "=========================================="

# 1. Supabase credentials check
echo ""
echo "1️⃣ Supabase ma'lumotlarini tekshirish..."

if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" == "https://frqrtlcjikatothymhxp.supabase.co" ]; then
  echo "✅ Supabase URL: https://frqrtlcjikatothymhxp.supabase.co"
else
  echo "⚠️  Supabase URL o'rnatilmagan"
fi

# 2. Database password setup
echo ""
echo "2️⃣ Database parolini o'rnatish..."
echo "⚠️  Quyidagi komandalatini ishga tushiring:"
echo "📍 Supabase Dashboard → Settings → Database → Connection info"
echo "📋 Password ni ko'chiring va quyida o'rnating:"
echo ""
read -p "Database Password kiriting: " DB_PASSWORD

# Update .env file
cd backend
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:$DB_PASSWORD@db.frqrtlcjikatothymhxp.supabase.co:5432/postgres|g" .env
echo "✅ .env fayldagi DATABASE_URL yangilandi"

# 3. Service Role Key
echo ""
echo "3️⃣ Service Role Key o'rnatish..."
read -p "Service Role Key kiriting (Supabase Settings → API): " SERVICE_ROLE_KEY

sed -i "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY|g" .env
echo "✅ Service Role Key yangilandi"

# 4. Install dependencies
echo ""
echo "4️⃣ Dependency-larni o'rnatish..."
npm install @supabase/supabase-js
echo "✅ Supabase SDK o'rnatildi"

# 5. Prisma migration
echo ""
echo "5️⃣ Prisma migration qilish..."
npx prisma migrate dev --name init_supabase
echo "✅ Database schema yaratildi"

# 6. Database seed (optional)
echo ""
echo "6️⃣ Sample ma'lumot yuklash (optional)..."
read -p "Sample ma'lumot yuklash istaysizmi? (y/n): " SEED_CHOICE
if [ "$SEED_CHOICE" == "y" ]; then
  npm run db:seed
  echo "✅ Sample ma'lumot yuklandi"
fi

echo ""
echo "=========================================="
echo "✅ Supabase Integration Completed!"
echo "=========================================="
echo ""
echo "📝 Keyingi qadamlar:"
echo "1. Backend ishga tushirish: npm run dev"
echo "2. Frontend ishga tushirish: cd ../frontend && npm run dev"
echo "3. Telegram bot token sozlash (agar kerak bo'lsa)"
echo ""
