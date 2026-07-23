# 🚀 Supabase Setup — Quick Start

## 📌 What You Have Now

✅ Supabase integration code configured  
✅ Prisma schema updated for PostgreSQL  
✅ Backend services ready  
✅ Environment files created  

## 🎯 What You Need To Do

### Required: 2 Minutes

1. **Get Database Password** 
   ```
   Supabase.com → Your Project → Settings → Database
   → Find "Password" → Copy it
   ```

2. **Update backend/.env**
   Replace `YOUR_PASSWORD` with actual password:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.frqrtlcjikatothymhxp.supabase.co:5432/postgres
   ```

3. **Get Service Role Key**
   ```
   Supabase.com → Settings → API → service_role (Secret)
   → Copy the long key
   ```

4. **Update backend/.env**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=the_long_key_you_copied
   ```

### Required: 5 Minutes

5. **Create Database Tables**
   - Supabase Dashboard → SQL Editor → New Query
   - Copy all content from: `backend/supabase_schema.sql`
   - Paste into editor
   - Click "Run"

6. **Test Backend**
   ```bash
   cd backend
   npm run dev
   ```
   Look for: `✅ Supabase PostgreSQL bog'landi`

### Optional: Setup Prisma

```bash
cd backend
npx prisma migrate dev --name init_supabase
# This creates migrations directory
```

## 📊 Project Structure After Integration

```
ielts-bot/
├── backend/
│   ├── .env (✅ Updated with Supabase)
│   ├── supabase_schema.sql (SQL tables)
│   ├── src/
│   │   ├── services/
│   │   │   └── supabase.service.js (NEW)
│   │   ├── config/env.js (✅ Updated)
│   │   └── index.js (✅ Updated)
│   └── prisma/
│       └── schema.prisma (✅ PostgreSQL)
│
├── frontend/
│   └── .env (✅ New with Supabase keys)
│
└── Documentation/
    ├── SUPABASE_SETUP.md (Detailed guide)
    ├── INTEGRATION_SUMMARY.md (Changes made)
    └── setup-supabase.sh (Auto setup)
```

## ✅ Verification Checklist

After setting up:

- [ ] DATABASE_URL in backend/.env is correct
- [ ] SUPABASE_SERVICE_ROLE_KEY in backend/.env is set
- [ ] Backend starts with `npm run dev`
- [ ] See `✅ Supabase PostgreSQL bog'landi` in logs
- [ ] SQL schema tables created in Supabase
- [ ] Can view tables in Supabase Dashboard

## 🔗 Useful Links

- 🌐 Supabase Dashboard: https://app.supabase.com
- 📖 Setup Guide: See SUPABASE_SETUP.md
- 📋 Integration Details: See INTEGRATION_SUMMARY.md

## 💬 Commands Reference

```bash
# Backend development
cd backend && npm run dev

# Frontend development  
cd frontend && npm run dev

# Full stack
npm run dev (from root)

# Database migrations
npx prisma migrate dev --name description
npx prisma migrate deploy

# Supabase CLI
supabase start   # Local Supabase
supabase stop
supabase status
```

## 🎉 You're Ready!

After completing the "Required" steps above, your IELTS Bot will be fully integrated with Supabase!

**Time needed**: ~10 minutes  
**Difficulty**: Easy  

---

**Next**: Read SUPABASE_SETUP.md for detailed instructions
