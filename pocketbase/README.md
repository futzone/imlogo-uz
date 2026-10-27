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

- `pb_hooks/typing_results.pb.js` — tez yozish natijasini mantiqiy tekshiradi:
  davomiylik sozlamaga, WPM, aniqlik va grafik kesimlari terilgan belgilar va
  bosishlarga mos bo'lishi kerak (WPM ≤ 250). Oldingi reytingdagi natijadan
  beri mashq davomiyligicha real vaqt o'tmagan bo'lsa, natija saqlanadi,
  lekin reytingga kirmaydi (`ranked = false`).
- `pb_hooks/dictation_works.pb.js` — diktant natijasini serverdagi asl matn
  bo'yicha qayta baholaydi; brauzer yuborgan `ball`/`baho` hisobga olinmaydi.
  Mavjud bo'lmagan diktant uchun natija qabul qilinmaydi.
- Umumiy mantiq: `pb_hooks/lib/integrity.js`. `pb_hooks/lib/evaluator.js` —
  saytdagi `src/lib/app/evaluator.ts` dan avtomatik yasaladi:
  `src/lib/app/evaluator.ts` o'zgarsa, `npm run pb:evaluator` ni ishga tushirib,
  faylni serverga qayta nusxalang.
- Migratsiya `1793092000_leaderboard_integrity.js` view'larni yangilaydi va
  mavjud natijalarni yangi qoidalar bo'yicha qayta tekshiradi.

To'liq himoya mumkin emas: tez yozish brauzerda o'lchanadi, diktant matni esa
brauzerda tekshirilishi uchun API orqali ochiq. Ishonarli soxta natijani real
vaqt sarflab yuborgan foydalanuvchini faqat moderatsiya to'xtatadi.

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
