# ✅ Supabase Integration Checklist

## 🎯 Pre-Setup Requirements
- [ ] Have Supabase account at https://app.supabase.co
- [ ] Know your project URL: `https://frqrtlcjikatothymhxp.supabase.co`
- [ ] Have your project ID: `frqrtlcjikatothymhxp`

---

## 📝 Step 1: Backend Environment Setup (5 min)

### Get Database Password
- [ ] Go to Supabase Dashboard: https://app.supabase.co
- [ ] Click your project
- [ ] Go to `Settings` → `Database`
- [ ] Find and copy the **Database Password**
- [ ] Update `backend/.env`:
  ```env
  DATABASE_URL=postgresql://postgres:PASSWORD_HERE@db.frqrtlcjikatothymhxp.supabase.co:5432/postgres
  ```

### Get Service Role Key
- [ ] Go to `Settings` → `API`
- [ ] Copy the **service_role** key (marked as "Secret")
- [ ] Update `backend/.env`:
  ```env
  SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY_HERE
  ```

**File to check**: `backend/.env`
```env
# Database - Supabase PostgreSQL
SUPABASE_URL=https://frqrtlcjikatothymhxp.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_-oiti0JWQ4rHm0Cjl4oO6w_-bIyojAt
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.frqrtlcjikatothymhxp.supabase.co:5432/postgres
```

---

## 📊 Step 2: Create Database Schema (5 min)

### Method 1: Using Supabase SQL Editor (Recommended)
- [ ] Go to Supabase Dashboard → `SQL Editor` → `New Query`
- [ ] Open file: `backend/supabase_schema.sql`
- [ ] Copy all content
- [ ] Paste into SQL Editor
- [ ] Click `Run` button
- [ ] Wait for success message

### Method 2: Using Prisma (Alternative)
```bash
cd backend
npx prisma migrate deploy
```

---

## 🔌 Step 3: Verify Connection

### Test Backend
- [ ] Open terminal in backend folder
- [ ] Run: `npm run dev`
- [ ] Check output for: `✅ Supabase PostgreSQL bog'landi`
- [ ] If error, check `.env` file again

### Verify Database
- [ ] Go to Supabase Dashboard
- [ ] Click `Tables` in left sidebar
- [ ] You should see:
  - [ ] `users`
  - [ ] `daily_topics`
  - [ ] `submissions`
  - [ ] `progress_stats`
  - [ ] `used_topics`

---

## 🚀 Step 4: Start Development Servers

### Backend
```bash
cd backend
npm run dev
```
Expected output:
```
✅ API server: http://localhost:3002
✅ Supabase PostgreSQL bog'landi
```

### Frontend (in new terminal)
```bash
cd frontend
npm run dev
```
Expected output:
```
➜ Local: http://localhost:5175
```

---

## 🧪 Step 5: Test Integration

### Check API Health
```bash
curl http://localhost:3002/api/health
```
Response should be:
```json
{
  "status": "ok",
  "timestamp": "2026-07-09T...",
  "uptime": 123.45
}
```

### Test Bot (Optional)
- [ ] Open Telegram
- [ ] Find your bot
- [ ] Send `/start`
- [ ] Check backend logs for messages

### Test Web App
- [ ] Open http://localhost:5175
- [ ] Check if page loads
- [ ] Open browser console for errors

---

## 🔐 Step 6: Security Setup

### Local Development
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Never commit passwords to Git
- [ ] Use different credentials for production

### Files to verify in `.gitignore`
- [ ] `backend/.env`
- [ ] `frontend/.env`
- [ ] `backend/.env.local`
- [ ] `frontend/.env.local`

---

## 📚 Step 7: Documentation Review

### Read these files (in order):
1. [ ] `QUICKSTART.md` - Quick overview
2. [ ] `INTEGRATION_SUMMARY.md` - What was changed
3. [ ] `SUPABASE_SETUP.md` - Detailed setup guide
4. [ ] `README.md` - Project overview

---

## ✨ Step 8: Optional Enhancements

### Storage for Audio Files
- [ ] Go to Supabase Dashboard → `Storage`
- [ ] Create new bucket: `audio`
- [ ] Make it public
- [ ] Update backend code to use storage

### Real-time Subscriptions
- [ ] Install: `npm install @supabase/realtime-js`
- [ ] Set up real-time listeners for updates
- [ ] Enable notifications

### Authentication
- [ ] Set up Supabase Auth
- [ ] Configure email/password authentication
- [ ] Set up OAuth providers

### Row Level Security (RLS)
- [ ] Enable RLS on tables (production only)
- [ ] Create security policies
- [ ] Test with different user roles

---

## 🐛 Troubleshooting

### Problem: Connection refused
**Solution**: 
- [ ] Check password in DATABASE_URL
- [ ] Check IP whitelisting in Supabase
- [ ] Try from Supabase dashboard connection test

### Problem: Table not found
**Solution**:
- [ ] Run SQL schema again
- [ ] Check Supabase SQL Editor output for errors
- [ ] Verify tables appear in Dashboard

### Problem: Permission denied
**Solution**:
- [ ] Check SUPABASE_SERVICE_ROLE_KEY
- [ ] Try with anon key instead
- [ ] Check RLS policies if enabled

### Problem: Timeout
**Solution**:
- [ ] Check internet connection
- [ ] Verify Supabase project is active
- [ ] Try with longer timeout value

---

## 📱 Final Verification

- [ ] Backend running: `http://localhost:3002`
- [ ] Frontend running: `http://localhost:5175`
- [ ] Database connected: Supabase dashboard shows tables
- [ ] API responding: `/api/health` returns data
- [ ] Environment variables set: Check `.env` files

---

## 🎉 Completion Status

- [ ] All steps completed
- [ ] Both servers running
- [ ] Database connected
- [ ] Ready for development

**Estimated Time**: 30-45 minutes  
**Difficulty Level**: Beginner-Friendly  

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **Telegraf Bot**: https://telegraf.js.org
- **Vite**: https://vitejs.dev

---

**Last Updated**: 2026-07-09  
**Status**: Ready for Setup
