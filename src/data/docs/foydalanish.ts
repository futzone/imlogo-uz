export const foydalanishContent = `
# Foydalanish qo'llanmasi

**Imlo Go** — o'zbek tilida diktant yozish, tekshirish va imloviy bilimlarni oshirish uchun mo'ljallangan zamonaviy dastur. Ushbu qo'llanma ilovadan samarali foydalanishning barcha bosqichlarini o'z ichiga oladi.

## Ilovani o'rnatish

Imlo Go quyidagi platformalarda mavjud:

| Platforma | Havola |
|-----------|--------|
| **Android** | Google Play Store orqali yuklab oling |
| **iOS** | App Store orqali yuklab oling |
| **Windows** | Rasmiy saytdan yuklab oling |
| **Web** | [app.imlogo.uz](https://app.imlogo.uz) da to'g'ridan-to'g'ri foydalaning |

O'rnatish uchun tegishli do'kondan **"Imlo Go"** deb qidiring yoki rasmiy saytga tashrif buyuring.

## Bosh sahifa va diktant tanlash

Ilovani ochganingizda **bosh sahifa**da mavjud diktantlar ro'yxati ko'rsatiladi. Har bir diktant kartasida quyidagi ma'lumotlar ko'rinadi:

- **Sarlavha** — diktant nomi
- **Sinf va yosh toifasi** — masalan, "3-sinf, 9-10 yosh"
- **So'zlar soni** — diktantdagi so'zlar miqdori
- **Taxminiy vaqt** — diktantni bajarish uchun kerak bo'ladigan vaqt

Kerakli diktantni tanlash uchun kartaga bosing.

## Diktant boshlash

Diktantni tanlaganingizdan so'ng **tayyorgarlik sahifasi** ochiladi. Bu yerda:

1. Diktant haqida batafsil ma'lumot bilan tanishing
2. **"Boshlash"** tugmasini bosing
3. Diktant sahifasi ochiladi — audio pleer va matn kiritish maydoni paydo bo'ladi

## Audio tinglash va matn yozish

Diktant sahifasida:

- **Audio pleer** — diktant yozuvini tinglash uchun. Play/Pause tugmasi va progress bar mavjud
- **Matn kiritish maydoni** — eshitgan matnni yozing
- **Taymer** — diktant boshlanganidan beri o'tgan vaqtni ko'rsatadi

### Maslahatlar:

- Audioga diqqat bilan quloq soling va tinch muhitda yozing
- Tinish belgilariga (vergul, nuqta, undov belgisi) e'tibor bering
- Tutuq belgilarini (\`) to'g'ri joylashtiring — bu baholashda muhim
- So'zlarni ajratib va to'g'ri yozing

## Natijalarni ko'rish

Matnni yozib bo'lgach **"Tekshirish"** tugmasini bosing. Natijalar sahifasida quyidagilar ko'rsatiladi:

### Baholar
- **5 ballik baho** — an'anaviy baholash tizimi (1 dan 5 gacha)
- **100 ballik ball** — foiz ko'rinishida aniqroq natija

### Xatolar tahlili
Aniqlangan xatolar 4 turga bo'linadi:

| Tur | Tavsif | Misol |
|-----|--------|-------|
| **Imloviy** | So'zni noto'g'ri yozish | "Toshkent" o'rniga "Toshken" |
| **Punktuatsion** | Tinish belgilari xatosi | Vergul tushib qolishi |
| **Uslubiy** | So'z qo'llash xatosi | "sher" o'rniga "she'r" |
| **Grafik** | Harf shakli xatosi | "o'" o'rniga "o'" |

Har bir xato uchun:
- Original matndagi **to'g'ri variant**
- Siz yozgan **xato variant**
- Xato turi va tavsifi ko'rsatiladi

## Natijalarni saqlash

Natijalar sahifasida **"Saqlash"** tugmasi mavjud. Saqlangan natijalar qurilmangizda (mahalliy) saqlanadi va istalgan vaqtda qayta ko'rib chiqishingiz mumkin.

## Tarix va oldingi natijalar

Bosh sahifadan **"Natijalar"** bo'limiga o'ting. Bu yerda:

- Barcha oldingi diktantlar natijalarini ko'rishingiz mumkin
- Har bir natija kartasida baho, xatolar soni va sana ko'rsatiladi
- Natijani bosib batafsil ma'lumotni qayta ko'rishingiz mumkin

> **Eslatma:** Natijalar qurilmangizda saqlanadi, shuning uchun ilovani o'chirsangiz, natijalar ham o'chadi. Kelajakda bulutli sinxronizatsiya qo'shish rejada bor.

## Tez-tez so'raladigan savollar

**Audio eshitilmayapti?**
Qurilmangiz tovush balandligini tekshiring va internetga ulanganligingizga ishonch hosil qiling — audio fayllar serverdan yuklanadi.

**Baho noto'g'ri chiqyapti?**
Baholash algoritmi tinish belgilari, bosh harflar va maxsus o'zbek belgilarini hisobga oladi. Batafsil ma'lumot uchun "Qanday ishlaydi?" bo'limiga qarang.

**Offline ishlaydi mi?**
Audio tinglash uchun internet kerak. Lekin saqlangan natijalarni oflayn rejimda ham ko'rishingiz mumkin.

## Tez yozish mashqi

Ilovaning **"Tez yozish"** bo'limida o'zbekcha so'zlarni tez va xatosiz terishni mashq qilishingiz mumkin.

1. Yuqoridagi paneldan rejimni tanlang: **vaqt** (15, 30, 60 yoki 120 soniya) yoki **so'zlar** (10, 25, 50 yoki 100 ta so'z)
2. Xohlasangiz, **tinish belgilari** va **raqamlar**ni yoqing
3. Yozishni boshlang — vaqt birinchi harf terilganda boshlanadi
4. Har bir so'zdan keyin **bo'sh joy** (probel) bosing
5. Mashq oxirida natija ko'rsatiladi

| Ko'rsatkich | Ma'nosi |
|-------------|---------|
| **WPM** | Daqiqasiga to'g'ri terilgan so'zlar soni (5 ta belgi = 1 so'z) |
| **Aniqlik** | To'g'ri bosilgan klavishlar foizi |
| **Xom tezlik** | Xatolar hisobga olinmagan tezlik |
| **Belgilar** | To'g'ri / xato / ortiqcha / tushib qolgan belgilar soni |
| **Barqarorlik** | Tezlik mashq davomida qanchalik bir tekis bo'lgani |

> **Tutuq belgisi haqida:** o', g' va tutuq belgisi uchun klaviaturangizdagi istalgan belgini (' ’ ‘ ʻ \`) ishlatishingiz mumkin — tez yozish mashqida ularning barchasi to'g'ri deb qabul qilinadi.

Kompyuterda **Tab** tugmasi mashqni qayta boshlaydi. Barcha natijalar qurilmangizda saqlanadi va **"Natijalarim" → "Tez yozish"** bo'limida ko'rinadi.
`;
