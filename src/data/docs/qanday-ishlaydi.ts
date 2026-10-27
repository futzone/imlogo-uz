export const qandayIshlaydiContent = `
Imlo Go foydalanuvçi tomonidan yozilgan diktant matnini original matn bilan soliştiriş, xatolarni aniqlaş va baholaş uçun maxsus algoritmlardan foydalanadi. Bu bölimda tekşiruvçi algoritm — **DiktantEvaluator** (\`src/lib/app/evaluator.ts\`) qanday işlaşi tuşuntiriladi. Veb-sayt va mobil ilova bir xil algoritmdan foydalanadi.

## Umumiy arxitektura

Tekşiriş jarayoni quyidagi asosiy bosqiçlardan iborat:

\`\`\`
Foydalanuvchi matni → Tokenizatsiya → Normallashtirish → Alignment
    → Xatolarni aniqlash → Klassifikatsiya → Baholash → Natija
\`\`\`

Har bir bosqiç alohida funksiya sifatida amalga oşirilgan bölib, bir-biriga ketma-ket boğlangan.

## Tokenizatsiya

Birinçi bosqiçda original va foydalanuvçi matnlari **tokenlarga** — sözlar va tiniş belgilariga ajratiladi.

Sözlar (lotin va kirill harflari, içida tutuq belgisi bölişi mumkin) va tiniş belgilari ketma-ketligi bitta muntazam ifoda bilan ajratib olinadi:

\`\`\`ts
const TOKEN_REGEX =
    /([a-zA-Z\\u00C0-\\u024F\\u0400-\\u04FF]+(?:['\\u2018\\u2019\\u02BB][a-zA-Z\\u00C0-\\u024F\\u0400-\\u04FF]+)*)|([.,;:!?\\-\\u2013\\u2014()«»"\\u201C\\u201D\\u2026]+)/g;
\`\`\`

**Misol:**
- Kiriş: \`"Salom, dunyo!"\`
- Natija: \`["Salom", ",", "dunyo", "!"]\`

## Normallaştiriş

Tokenlar soliştirişdan oldin bir xil körinişga keltiriladi:

- Barça harflar **kiçik harfga** ötkaziladi
- Özbek maxsus belgilari standartlaştiriladi: \`ў → o'\`, \`ғ → g'\`
- Turli tutuq belgilari yagona şaklga keltiriladi: \`'\`, \`ʻ\`, \`'\` → \`'\`
- Qöştirnoqlar normallaştiriladi: \`"\`, \`"\`, \`«\`, \`»\` → \`"\`


> **Nima uçun kerak?** Harf registri yoki \`ў\` vs \`o'\` kabi yozuvdagi farqlar tufayli notöğri xato topilişining oldini oliş uçun. Boş harf xatosi alohida tekşiriladi.

## Levenshtein alignment algoritmi

Bu algoritmning eng muhim qismi — original va foydalanuvçi tokenlarini **juftlaştiriş**. Buning uçun **Levenshtein masofasi** (Wagner-Fischer) algoritmi qöllaniladi.

### Algoritmning işlaş printsipi:

1. \`(n+1) × (m+1)\` ölçamli **DP matritsa** tuziladi
2. Har bir katak uçun minimal tahrir masofasi hisoblanadi
3. **Traceback** — orqaga qaytib juftliklar aniqlanadi

### Juftlik turlari:

| Tur | Ma'nosi |
|-----|---------|
| **MATCH** | Tokenlar mos keladi |
| **SUBSTITUTION** | Token almaştirilgan (xato) |
| **DELETION** | Originaldagi token foydalanuvçida yöq |
| **INSERTION** | Foydalanuvçida ortiqça token bor |


**Misol:**
- Original: \`["Salom", ",", "dunyo"]\`
- Foydalanuvçi: \`["Salom", "aziz", "dunyo"]\`
- Natija: \`MATCH(Salom), DELETION(,), INSERTION(aziz), MATCH(dunyo)\`

## Xatolarni klassifikatsiya qiliş

Har bir juftlangan token farqi **xato turiga** ajratiladi:

### Xato turlari

Tört tur: **IMLO** (imloviy), **PUNKTUATSION** (tiniş belgilari), **USLUBIY** (paronimlar) va **GRAFIK** (oʻ/gʻ belgisi).

### DELETION (Tuşib qolgan token)

| Token turi | Xato kodi | Izoh |
|-----------|-----------|------|
| Tiniş belgisi | \`punkt_tushibqolgan_umumiy\` | Vergul, nuqta va h.k. |
| Söz | \`imlo_tushibqolgan_guruh\` | Ketma-ket tuşib qolganlar bitta xato |
| 5+ söz | \`imlo_katta_hajm_tushibqolgan\` | Katta hajmli tuşib qoliş |

### INSERTION (Ortiqça token)

| Token turi | Xato kodi | Izoh |
|-----------|-----------|------|
| Tiniş belgisi | \`punkt_ortiqcha_umumiy\` | Ortiqça tiniş belgisi |
| Söz | \`imlo_ortiqcha_guruh\` | Ketma-ket ortiqçalar bitta xato |

### SUBSTITUTION (Almaştiriş) — eng murakkab qism

Söz almaştirilganda quyidagi tekşiruvlar ketma-ket amalga oşiriladi:

1. **Grafik xato** — oʻ yoki gʻ dagi belgi tuşib qolgan («o‘zbek» → «ozbek»)
2. **Boş harf xatosi** — faqat registr farqi bölsa
3. **h/x almaşinuvi** — \`imlo_h_x_almashinuvi\`
4. **Tutuq belgisi** — tuşib qolgan yoki ortiqça tutuq belgisi
5. **Klaviatura yaqinligi** — yonma-yon tugmalar tufayli yuzaga kelgan xato (jarima koeffitsienti: 0.5)
6. **Umumiy imlo xatosi** — yuqoridagilardan heç biri topilmasa

\`\`\`ts
// Klaviatura yaqinligi (QWERTY): yonma-yon tugmalar
const ADJACENT_KEYS: Record<string, string[]> = {
    q: ['w', 'a'],
    w: ['q', 'e', 's', 'a'],
    // ... barcha tugmalar uchun
};
\`\`\`

## Maxsus qoidalar

### Tutuq belgisi tekşiruvi
Özbek tilida tutuq belgisi (\`'\`) muhim ahamiyatga ega. Tizim quyidagilarni aniqlaydi:
- **Tuşib qolgan tutuq belgisi** — \`to'g'ri\` örniga \`togri\`
- **Ortiqça tutuq belgisi** — \`so'z\` örniga \`so'z'\`

### Boş harf qoidasi
Agar ikkita söz faqat boş harf bilan farq qilsa (\`Toshkent\` vs \`toshkent\`), bu alohida imloviy xato sifatida qayd etiladi.

### Sözlarni qöşib/ajratib yoziş
- **Qöşib yoziş**: \`"bugun" + "kecha"\` → \`"bugunkecha"\` — \`imlo_sozlar_qoshib_yozilgan\`
- **Ajratib yoziş**: \`"bugunkecha"\` → \`"bugun kecha"\` — \`imlo_soz_ajratib_yozilgan\`

### Paronimlar (uslubiy xatolar)
Ma'nosi yaqin, lekin farqli sözlar:
- \`abzal\` vs \`afzal\`
- \`sher\` vs \`she'r\`
- \`hol\` vs \`xol\`

## "Bir tipdagi xato" qoidasi

Agar bir xil xato bir neça joyda takrorlansa, u **bitta xato** deb hisoblanadi. Masalan, agar foydalanuvçi "Toshkent" sözini 3 marta "Toshken" deb yozsa — bu 1 ta unikal imlo xatosi.

\`\`\`ts
private addError(type: ErrorType, description: string, original: string, user: string, code: string, multiplier = 1) {
    this.detectedErrors.push({ type, description, originalFragment: original, userFragment: user, specificRuleCode: code, penaltyMultiplier: multiplier });
    // Har bir turdagi unikal xato kodlari — baho shular soni bo'yicha qo'yiladi
    this.uniqueErrorCodes[type].add(code);
}
\`\`\`

Baholaş **unikal xatolar soni** asosida amalga oşiriladi.

## Katastrofik nomuvofiqlik

Agar foydalanuvçi matni originalga umuman öxşamasa (masalan, juda qisqa yoki ma'nosiz sözlar kiritilsa), tizim buni alohida aniqlaydi:

Matn juda qisqa bölsa va asl matn bilan mos sözlar uluşi juda kiçik bölsa, \`imlo_katastrofik_nomuvofiqlik\` xatosi qöşiladi va keyingi tahlil töxtatiladi.

Bu holda avtomatik ravişda **1 baho** (5 ballik) yoki **0 ball** (100 ballik) qöyiladi.

## Baholaş şkalasi

### 5 ballik tizim

Baho **unikal** xatolar soni böyiça, yuqoridan pastga birinçi mos kelgan qator böyiça qöyiladi:

| Baho | Şart |
|------|-------|
| **5** | jami xatolar ≤ 1 |
| **4** | imloviy ≤ 2 **va** jami ≤ 4 |
| **3** | imloviy ≤ 4 **va** jami ≤ 8 |
| **2** | imloviy ≤ 7 **va** jami ≤ 14 |
| **1** | qolgan barça holatlar yoki katastrofik xato |

### 100 ballik tizim

Har bir aniqlangan xato uçun balldan ayriladi:

| Xato turi | Jarima | Misol |
|-----------|--------|-------|
| Imloviy | **-2.5 ball** | "Toshken" → -2.5 |
| Punktuatsion | **-2.0 ball** | Vergul tuşib qolişi → -2.0 |
| Uslubiy | **-1.5 ball** | Paronim xatosi → -1.5 |
| Grafik | **-1.5 ball** | «o‘zbek» → «ozbek» |

\`penaltyMultiplier\` koeffitsienti hisobga olinadi (masalan, klaviatura yaqinligi uçun 0.5).

\`\`\`ts
evaluate100PointScale(): number {
    if (this.hasCriticalError) return 0;
    const penalties = { IMLO: 2.5, PUNKTUATSION: 2, USLUBIY: 1.5, GRAFIK: 1.5 };
    let score = 100;
    for (const error of this.detectedErrors) score -= penalties[error.type] * error.penaltyMultiplier;
    return Math.min(100, Math.max(0, score));
}
\`\`\`

## Xulosa

DiktantEvaluator algoritmi bir neça bosqiçli yondaşuvdan foydalanadi: tokenizatsiya, normallaştiriş, Levenshtein alignment va xatolarni klassifikatsiya qiliş. "Bir tipdagi xato" va "katastrofik nomuvofiqlik" kabi maxsus holatlar ham hisobga olinadi. Natija bir neçta baholaş usulida çiqariladi.
`;
