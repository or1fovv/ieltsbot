# IELTS & CEFR Telegram Bot + Web App

To'liq ishlaydigan ingliz tilini o'rganish va test topshirish platformasi. Foydalanuvchilar Telegram bot va zamonaviy Web App orqali kunlik Speaking va Writing testlarini topshirishlari, Claude API orqali professional feedback olishlari va o'z progresslarini kuzatishlari mumkin.

## Texnologiyalar

- **Backend**: Node.js, Express
- **Database**: PostgreSQL, Prisma ORM
- **Telegram Bot**: Telegraf
- **Frontend (Web App)**: React, Vite, TailwindCSS v4, Zustand, Recharts
- **AI xizmatlari**: Anthropic Claude API (baholash), OpenAI Whisper API (ovozni matnga o'girish)

## Loyiha Tuzilishi

Loyiha ikki qismdan iborat: `backend` va `frontend`. Ikkala qism ham birgalikda ishlashi uchun sozlangan.

## Ishga tushirish (Local Development)

### 1. Talablar
- Node.js (v18+)
- PostgreSQL bazasi (lokal yoki bulutda, masalan Supabase / Neon)
- Telegram Bot token (BotFather dan)
- Anthropic API kaliti
- OpenAI API kaliti

### 2. Backend sozlash

```bash
cd backend
npm install
```

`.env` faylini `backend` papkasida yarating (`.env.example` dan nusxa oling):
```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/ielts_bot
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
WEB_APP_URL=http://localhost:5173
```

Database migratsiyasini ishga tushirish:
```bash
npx prisma migrate dev --name init
```

Backend va botni ishga tushirish:
```bash
npm run dev
```

### 3. Frontend sozlash

Yangi terminal oynasini oching:
```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` da ishga tushadi. API so'rovlar Vite proxy orqali `http://localhost:3001` ga yuboriladi.

## Production Deploy (Serverga joylash)

### Backend deploy (Render / Railway / VPS)
1. Environment variables ni serverga kiriting.
2. Build commands:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm start
   ```

### Frontend deploy (Vercel / Netlify)
1. Environment variables: `VITE_API_URL` ni backend serveringiz manziliga moslang (masalan, `https://api.yourdomain.com`). Eslatma: Hozirgi kodda proxy ishlatilgan, production uchun `axios` baseURL ni to'g'irlash kerak bo'lishi mumkin.
2. Build command:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. `dist` papkasini serve qiling.

### Telegram Web App ni ulash
1. BotFather ga kiring, botingizni tanlang.
2. `/setmenubutton` -> Web App URL ni frontend linkiga o'rnating.
3. `/mybots` -> Bot settings -> Menu Button -> Web App URL.

## Eslatmalar
- **Cron Jobs**: Kunlik mavzular yarim tunda avtomatik yaratiladi (UTC 00:00).
- **Audio Files**: Hozirda audio fayllar backenddagi `uploads/` papkasiga saqlanadi. Production muhitida AWS S3 yoki shunga o'xshash xizmatdan foydalanish tavsiya etiladi.
- **Telegram Auth**: Web App dagi xavfsizlik `initData` orqali ta'minlangan. Dev muhitida (`import.meta.env.DEV`) auth mock qilingan bo'lishi mumkin. Haqiqiy test uchun Telegram mijozidan kirish kerak.
