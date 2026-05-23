# 🚗 Avtotest Karimjon — Prava tayyorlov landing

Next.js (App Router) da yasalgan 1 sahifali sotuv (landing) sayti.
Lead forma → **Telegram bot** ga yuboradi, **Meta Pixel + CAPI** ga event jo'natadi.

---

## 📋 Nima bor?

- ✅ 1 sahifali zamonaviy, animatsion landing
- ✅ Lead forma (ism, familya, telefon, yashash joyi, guvohnoma Ha/Yo'q)
- ✅ Telegram botga avtomatik xabar
- ✅ Meta (Facebook) Pixel — brauzer tomonida
- ✅ Meta Conversions API (CAPI) — server tomonida (yaxshiroq tracking)
- ✅ To'liq mobil-responsive
- ✅ SEO sozlamalar

---

## 🛠 1-qadam: O'rnatish

Kompyuteringizda [Node.js](https://nodejs.org) (18 yoki undan yuqori) o'rnatilgan bo'lsin.

Loyiha papkasida terminal oching va yozing:

```bash
npm install
```

---

## 🔑 2-qadam: Sozlamalar (.env.local)

`.env.example` faylini nusxalab `.env.local` deb nomlang:

```bash
cp .env.example .env.local
```

Keyin `.env.local` faylini ochib qiymatlarni to'ldiring:

### 📱 Telegram bot sozlash

1. Telegramda **@BotFather** ni toping, `/newbot` yozing
2. Bot nomi va username bering → sizga **token** beradi (masalan: `7123456789:AAEx...`)
3. Bu tokenni `TELEGRAM_BOT_TOKEN` ga qo'ying
4. **Chat ID** olish:
   - Botingizga **@userinfobot** orqali yoki
   - Botga biror xabar yozing, keyin brauzerda oching:
     `https://api.telegram.org/bot<TOKEN>/getUpdates`
     u yerdagi `"chat":{"id": ...}` raqamini oling
   - Bu raqamni `TELEGRAM_CHAT_ID` ga qo'ying
   - **Guruhga** yubormoqchi bo'lsangiz: botni guruhga qo'shing, guruh ID si manfiy bo'ladi (masalan `-1001234567890`)

### 📊 Meta Pixel sozlash

1. [Facebook Events Manager](https://business.facebook.com/events_manager) ga kiring
2. Pixel yarating yoki mavjudini oching → **Pixel ID** ni oling
3. `NEXT_PUBLIC_META_PIXEL_ID` ga qo'ying

### 📈 Meta CAPI (Conversions API) sozlash

1. Events Manager → Settings → **Conversions API**
2. **Generate Access Token** bosing
3. Tokenni `META_CAPI_ACCESS_TOKEN` ga qo'ying

> CAPI ixtiyoriy, lekin reklama natijasini ancha yaxshilaydi (iOS, ad-blocker holatlarida ham ishlaydi).

---

## ▶️ 3-qadam: Ishga tushirish

**Test rejimida (lokal):**

```bash
npm run dev
```

Brauzerda oching: http://localhost:3000

**Production uchun:**

```bash
npm run build
npm start
```

---

## 🚀 4-qadam: Internetga joylash (Vercel — bepul)

1. [vercel.com](https://vercel.com) da ro'yxatdan o'ting
2. Loyihani GitHub ga yuklang yoki Vercel CLI orqali deploy qiling
3. Vercel'da **Settings → Environment Variables** bo'limiga `.env.local` dagi barcha qiymatlarni qo'shing
4. Deploy bosing — tayyor!

> ⚠️ Muhim: `.env.local` faylidagi maxfiy tokenlarni hech kimga bermang va GitHub'ga yuklamang (`.gitignore` allaqachon himoyalagan).

---

## 📂 Loyiha tuzilishi

```
avtotest-karimjon/
├── app/
│   ├── api/lead/route.js     ← Telegram + Meta CAPI yuborish
│   ├── components/LeadForm.js ← Forma (client component)
│   ├── globals.css            ← Barcha stillar + animatsiyalar
│   ├── layout.js              ← Meta Pixel + SEO
│   └── page.js                ← Asosiy sahifa
├── .env.example               ← Sozlamalar namunasi
├── package.json
└── README.md
```

---

## ❓ Savol-javob

**Forma ishlamayapti?**
`.env.local` to'g'ri to'ldirilganini va serverni qaytadan ishga tushirganingizni tekshiring (`npm run dev`).

**Telegram xabar kelmayapti?**
Botga avval `/start` bosganingizni va Chat ID to'g'riligini tekshiring.

**Pixel ishlayaptimi?**
Facebook Events Manager → Test Events bo'limida ko'rishingiz mumkin.

---

Savol bo'lsa — yordam beraman! 🚦
# AvtotestKarimjon
