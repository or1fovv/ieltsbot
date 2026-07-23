# 🔐 Supabase Integration Setup Guide

## 📋 Prerequisites

Siz allaqachon qo'shgan:
- **Supabase URL**: https://frqrtlcjikatothymhxp.supabase.co
- **Publishable Key**: sb_publishable_-oiti0JWQ4rHm0Cjl4oO6w_-bIyojAt

## 🚀 Setup Steps

### 1️⃣ Database Connection String sozlash

`.env` fayldagi `DATABASE_URL` ni quyidagicha o'rnatish kerak:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.frqrtlcjikatothymhxp.supabase.co:5432/postgres
```

**PASSWORD ni qanday topish:**
1. Supabase dashboard ga kiring: https://app.supabase.com
2. Your project ni tanlang
3. `Settings` → `Database` → `Connection Info`
4. Password ni ko'rib oling va `.env` fayliga qo'ying

### 2️⃣ Service Role Key olish

1. Supabase dashboard: `Settings` → `API`
2. `service_role` key ni ko'chiring
3. `.env` fayliga qo'ying:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3️⃣ Database Schema yaratish

1. Supabase dashboard ga kiring
2. `SQL Editor` → `New Query` ni ochish
3. `supabase_schema.sql` fayl mazmunini SQL editoriga ko'chiring
4. `Run` tugmasini bosing

### 4️⃣ Storage Bucket yaratish (Optional - Audio fayllar uchun)

1. Supabase dashboard: `Storage` → `New Bucket`
2. Name: `audio`
3. Public bo'lgan` checkbox ni belgilang
4. Create bucket

### 5️⃣ Backend ishga tushirish

```bash
cd backend
npm install
npm run dev
```

### 6️⃣ Prisma Migration qilish

```bash
# Supabase bog'lanish mavjud bo'lgach
cd backend
npx prisma migrate deploy
# yoki yangi migration yaratish uchun:
npx prisma migrate dev --name init_supabase
```

## 🔐 Security Tips

✅ **Kerakli:**
- `.env` faylida parollar va keylar saqlansin
- Hech qachon `.env` ni Git'ga push qilmang
- `.gitignore` da `.env` yozilgan bo'lsin

⚠️ **RLS (Row Level Security) **Recommended**
- Production uchun RLS ni yoqing: SQL Schema fayldagi RLS commentini o'chirib tashlang
- Foydalanuvchi o'z ma'lumotlarini ko'rishi uchun policy yaratish kerak

## 🧪 Test qilish

Backend API health check:
```bash
curl http://localhost:3002/api/health
```

## 📚 Keyingi qadamlar

1. **Frontend Supabase integratsiyasi** (Authentication uchun)
2. **RLS Policies** (Security uchun)
3. **Real-time subscriptions** (WebSocket uchun)
4. **Backup strategies** (Data protection uchun)

## 🆘 Muammolar

### 1. Connection refused xatosi
- Password noto'g'ri
- IP whitelisting: Supabase Settings → Network → Add IP

### 2. Table not found xatosi
- SQL schema run qilmagan
- Migration deploy qilmagan

### 3. Permission denied xatosi
- Service Role Key noto'g'ri
- RLS policy sozlanmagan

## 📞 Supabase Support
- Docs: https://supabase.com/docs
- Dashboard: https://app.supabase.com
