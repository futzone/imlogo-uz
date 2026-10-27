export const texnikContent = `
Imlo Go ikki qismdan iborat: **veb-sayt** (imlogo.uz) va **mobil/desktop ilova** (Flutter). Ikkalasi ham bitta **PocketBase** serveri (admin.imlogo.uz) bilan işlaydi.

## Texnologiyalar

| Qism | Texnologiya |
|------|-------------|
| Veb-sayt | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Mobil va Windows ilova | Flutter (Riverpod, Hive, audioplayers) |
| Backend | PocketBase — ma’lumotlar bazasi, fayllar, autentifikatsiya |
| Kiriş | Email + parol, Google OAuth2 |
| Poçta | Brevo (parolni tiklaş xatlari) |

## Veb-sayt tuzilişi

\`\`\`
src/
├── app/
│   ├── (site)/            # landing va qo'llanma
│   └── app/
│       ├── (main)/        # dashboard: diktant, tez yozish, translator,
│       │                  # hamjamiyat, natijalar, profil, loyiha haqida
│       ├── diktant/       # diktant yozish sahifasi
│       └── natija/        # diktant natijasi
├── components/app/        # ilova komponentlari (auth, shell, typing, ...)
├── lib/app/
│   ├── evaluator.ts       # diktantni tekshiruvchi algoritm
│   ├── typing/            # tez yozish dvigateli
│   ├── account.ts         # hisob, natijalarni yuklash, reyting
│   ├── history.ts         # natijalar tarixi va ketma-ket kunlar
│   └── storage.ts         # brauzer xotirasi (localStorage)
└── lib/translit/          # transliteratsiya qoidalari va lug'at
\`\`\`

## Ma’lumotlar oqimi

- **Diktantlar** — \`dictations\` kolleksiyasidan sahifalab yuklanadi; audio fayllar PocketBase fayl omboridan: \`/api/files/{collectionId}/{recordId}/{fayl}\`.
- **Tekşiriş** töliq brauzerda bajariladi (\`DiktantEvaluator\`) — matn serverga yuborilmaydi. Algoritm: [Diktant qanday baholanadi](/qollanma/qanday-ishlaydi).
- **Natijalar** avval brauzer xotirasiga yoziladi. Foydalanuvçi kirgan bölsa, nusxasi serverga ham yuboriladi; serverdagi va qurilmadagi natijalar \`history.ts\` da birlaştiriladi.

## PocketBase kolleksiyalari

| Kolleksiya | Turi | Kim köradi | Vazifasi |
|------------|------|-------------|----------|
| \`dictations\` | base | hamma | Diktant matnlari va audio |
| \`users\` | auth | özi | Foydalanuvçilar (ism, avatar) |
| \`typing_results\` | base | özi | Tez yoziş natijalari |
| \`dictation_works\` | base | özi | Diktant natijalari (har diktant böyiça bittadan) |
| \`typing_leaderboard\` (+ \`_week\`, \`_prev_week\`) | view | hamma | Tez yoziş reytingi |
| \`dictation_leaderboard\` (+ \`_week\`, \`_prev_week\`) | view | hamma | Diktant reytingi |
| \`feedback\` | base | faqat admin | Murojaatlar |

Reytinglar — SQL view kolleksiyalar: ular hisoblangan körsatkiçlarni beradi, email va boşqa şaxsiy ma’lumotlar çiqmaydi. Hafta çegarasi (duşanba 00:00, UTC+5) sörov paytida hisoblanadi, şuning uçun alohida rejalaştirilgan vazifa kerak emas.

Server tomonidagi hooklar:

- \`typing_results.pb.js\` — natija yozilişidan oldin uning mantiqan töğriligini tekşiradi (WPM terilgan belgilarga mos kelişi kerak);
- \`mailer.pb.js\` — xatlarni Brevo HTTP API orqali yuboradi.

Sxema migratsiyalari repozitoriyda: \`pocketbase/pb_migrations/\`.

## Transliteratsiya

Qoidalar \`src/lib/translit/core.ts\` da, istisnolar luğati — \`public/translit/lexicon.txt\` (har qatorda «lotinça-kalit kirillça»). Luğat faqat translator yoki tez yoziş oçilganda yuklanadi (~27 KB, gzip).

Luğat qayta yiğiladi va tekşiriladi:

\`\`\`bash
npm run translit:build   # ../sources dagi so'zlar ro'yxatidan lexicon.txt yasaydi
npm run translit:test    # transliteratsiya testlari
\`\`\`

Yiğiş ğoyasi: kirill yozuvi bir qiymatli. Har bir kirillça söz lotinga ögiriladi va qoidalar böyiça qaytadan kirillga ögiriladi; natija asl sözdan farq qilsa, söz luğatga yoziladi. Bir xil lotinça yozilişli sözlardan eng köp işlatiladigani tanlanadi.

## Mobil ilova (Flutter)

| Komponent | Kutubxona |
|-----------|-----------|
| Holat boşqaruvi | Riverpod + Hooks |
| Mahalliy saqlaş | Hive |
| Audio | audioplayers |
| Backend | pocketbase (Dart SDK) |

Ilova Android, iOS va Windows uçun bitta kod bazasidan yiğiladi.

## Işga tuşiriş (veb)

\`\`\`bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production yig'ish
npm run lint
\`\`\`
`;
