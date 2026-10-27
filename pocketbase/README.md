# PocketBase (admin.imlogo.uz) sozlamalari

Saytdagi hisob, natijalar sinxronizatsiyasi, reyting va murojaatlar uchun
serverda quyidagilar kerak (PocketBase v0.23+).

## 1. Kolleksiyalar

`pb_migrations/` va `pb_hooks/` ichidagi fayllarni serverdagi shu nomli
papkalarga nusxalab, PocketBase'ni qayta ishga tushiring — migratsiya
avtomatik qo'llanadi:

| Kolleksiya | Turi | Vazifasi |
|---|---|---|
| `typing_results` | base | Tez yozish natijalari (yozuv: eski/yangi/kirill). Foydalanuvchi faqat o'zinikini ko'radi |
| `dictation_works` | base | Diktant natijalari — har bir diktant bo'yicha oxirgi urinish |
| `typing_leaderboard`, `_week`, `_prev_week` | view | Tez yozish reytingi: hamma vaqt, shu hafta, o'tgan hafta |
| `dictation_leaderboard`, `_week`, `_prev_week` | view | Diktant reytingi: xuddi shunday |
| `feedback` | base | Murojaatlar. Faqat admin o'qiydi, `status` maydonini admin belgilaydi |

Haftalik musobaqa dushanba 00:00 da (Toshkent vaqti, UTC+5) yangilanadi —
alohida cron kerak emas, view'lar sanani so'rov paytida hisoblaydi.

### Reytingni g'irromlikdan himoyalash

- **Tez yozish** — `pb_hooks/typing_api.pb.js` (mantiq: `pb_hooks/lib/typing_api.js`):
  - `POST /api/imlogo/typing/start` — so'zlarni server tanlaydi, mashqni
    `typing_tests` ga yozadi (daqiqasiga 30 tadan ko'p emas);
  - `POST /api/imlogo/typing/submit` — brauzer faqat bosishlar logini yuboradi;
    server uni shu so'zlar ustida qayta o'ynab, natijani o'zi hisoblaydi,
    evristikalar (`src/lib/app/typing/guard.ts`: bir zumda ko'p belgi, bir xil
    marom, nusxalash, klavishsiz kiritish, 250 WPM dan tez) va server vaqti
    bo'yicha tekshiradi. Mashq bir martalik; shubhali natija `flagged = true`
    bilan saqlanadi va reytingga kirmaydi.
  - To'g'ridan-to'g'ri yuklangan natija (`typing_results.pb.js`: kirishdan
    oldingi natijalar, ilovaning eski versiyalari) mantiqan tekshiriladi va
    faqat tarixda saqlanadi (`ranked = false`).
- **Diktant** — `pb_hooks/dictation_works.pb.js` natijani serverdagi asl matn
  bo'yicha qayta baholaydi; brauzer yuborgan `ball`/`baho` hisobga olinmaydi.
- `pb_hooks/lib/evaluator.js`, `typing.js` va `data/` saytdagi koddan
  yasaladi: `src/lib/app/evaluator.ts`, `src/lib/app/typing/*` yoki so'zlar
  ro'yxati o'zgarsa, `npm run pb:lib` ni ishga tushirib, `pb_hooks/lib/` ni
  serverga qayta nusxalang. Testlar: `npm run typing:test`.

To'liq himoya mumkin emas: odamga o'xshab, real vaqtda yozadigan murakkab
botni faqat moderatsiya to'xtatadi (`typing_tests.log` da har bir natijaning
bosishlar logi 30 kun saqlanadi). Diktant matni esa brauzerda tekshirilishi
uchun API orqali ochiq.

## 2. Google orqali kirish

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Create credentials → OAuth client ID** → *Web application*.
2. **Authorized redirect URI**: `https://admin.imlogo.uz/api/oauth2-redirect`
3. PocketBase admin → `users` kolleksiyasi → ⚙️ **Options → OAuth2** → yoqing → **Google** qo'shing (Client ID, Client secret).
4. Shu oynada **Fields mapping**: `name` → `name`, `avatarURL` → `avatar` — ism va rasm reytingda ko'rinadi.

## 3. Email va parol

`users` kolleksiyasida *Identity/Password* allaqachon yoqilgan. Email
tasdiqlash (OTP) talab qilinmaydi.

"Parolni unutdingizmi?" ishlashi uchun **Settings → Mail settings** da SMTP
sozlang (masalan, Brevo: `smtp-relay.brevo.com`, port 587) va **Settings →
Application → URL** = `https://admin.imlogo.uz`. Tiklash havolasi PocketBase'ning
o'z sahifasini ochadi — saytda alohida sahifa shart emas.

## 4. Tavsiya etiladi

- **Settings → Rate limiting** ni yoqing (ro'yxatdan o'tish, kirish va `feedback` uchun spamdan himoya).
- Murojaatlarni `feedback` kolleksiyasida `created` bo'yicha saralab ko'ring.
