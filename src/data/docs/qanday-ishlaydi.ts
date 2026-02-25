export const qandayIshlaydiContent = `
# Qanday ishlaydi?

Imlo Go dasturi foydalanuvchi tomonidan yozilgan diktant matnini original matn bilan solishtirish, xatolarni aniqlash va baholash uchun maxsus algoritmlardan foydalanadi. Ushbu bo'limda **DiktantEvaluator** klassining ish printsipi batafsil tushuntiriladi.

## Umumiy arxitektura

Tekshirish jarayoni quyidagi asosiy bosqichlardan iborat:

\`\`\`
Foydalanuvchi matni → Tokenizatsiya → Normallashtirish → Alignment
    → Xatolarni aniqlash → Klassifikatsiya → Baholash → Natija
\`\`\`

Har bir bosqich alohida funksiya sifatida amalga oshirilgan bo'lib, bir-biriga ketma-ket bog'langan.

## Tokenizatsiya

Birinchi bosqichda original va foydalanuvchi matnlari **tokenlarga** — so'zlar va tinish belgilariga ajratiladi.

\`\`\`dart
List<String> _tokenize(String text) {
  final RegExp punctuationRegex = RegExp(r"([,\\.:;!\\?()\\"\\'\\x60''""«»])");
  String spacedText = text.replaceAllMapped(
    punctuationRegex, (match) => " \${match.group(0)} "
  );
  return spacedText.trim().split(RegExp(r'\\s+'))
      .where((t) => t.isNotEmpty).toList();
}
\`\`\`

**Misol:**
- Kirish: \`"Salom, dunyo!"\`
- Natija: \`["Salom", ",", "dunyo", "!"]\`

## Normallashtirish

Tokenlar solishtirishdan oldin bir xil ko'rinishga keltiriladi:

- Barcha harflar **kichik harfga** o'tkaziladi
- O'zbek maxsus belgilari standartlashtiriladi: \`ў → o'\`, \`ғ → g'\`
- Turli tutuq belgilari yagona shaklga keltiriladi: \`'\`, \`ʻ\`, \`'\` → \`'\`
- Qo'shtirnoqlar normallashtiriladi: \`"\`, \`"\`, \`«\`, \`»\` → \`"\`

\`\`\`dart
String _normalizeChar(String char) {
  String normalized = char;
  normalized = normalized.replaceAll(RegExp(r"[''ʻ]"), "'");
  // ў → o', ғ → g' va boshqa almashtirishlar
  return normalized;
}
\`\`\`

> **Nima uchun kerak?** Harf registri yoki \`ў\` vs \`o'\` kabi yozuvdagi farqlar tufayli noto'g'ri xato topilishining oldini olish uchun. Bosh harf xatosi alohida tekshiriladi.

## Levenshtein alignment algoritmi

Bu algoritmning eng muhim qismi — original va foydalanuvchi tokenlarini **juftlashtirish**. Buning uchun **Levenshtein masofasi** (Wagner-Fischer) algoritmi qo'llaniladi.

### Algoritmning ishlash printsipi:

1. \`(n+1) × (m+1)\` o'lchamli **DP matritsa** tuziladi
2. Har bir katak uchun minimal tahrir masofasi hisoblanadi
3. **Traceback** — orqaga qaytib juftliklar aniqlanadi

### Juftlik turlari:

| Tur | Ma'nosi |
|-----|---------|
| **MATCH** | Tokenlar mos keladi |
| **SUBSTITUTION** | Token almashtirilgan (xato) |
| **DELETION** | Originaldagi token foydalanuvchida yo'q |
| **INSERTION** | Foydalanuvchida ortiqcha token bor |

\`\`\`dart
List<AlignedPair> _alignTokens(
  List<String> originalTokens,
  List<String> userTokens
) {
  // Wagner-Fischer DP matritsasini to'ldirish
  // Traceback orqali AlignedPair ro'yxatini tiklash
  return alignedPairs;
}
\`\`\`

**Misol:**
- Original: \`["Salom", ",", "dunyo"]\`
- Foydalanuvchi: \`["Salom", "aziz", "dunyo"]\`
- Natija: \`MATCH(Salom), DELETION(,), INSERTION(aziz), MATCH(dunyo)\`

## Xatolarni klassifikatsiya qilish

Har bir juftlangan token farqi **xato turiga** ajratiladi:

### Xato turlari

\`\`\`dart
enum ErrorType {
  IMLO,          // Imloviy xatolar
  PUNKTUATSION,  // Tinish belgilari xatolari
  USLUBIY,       // Uslubiy xatolar
  GRAFIK,        // Grafik xatolar
}
\`\`\`

### DELETION (Tushib qolgan token)

| Token turi | Xato kodi | Izoh |
|-----------|-----------|------|
| Tinish belgisi | \`punkt_tushibqolgan_umumiy\` | Vergul, nuqta va h.k. |
| So'z | \`imlo_tushibqolgan_guruh\` | Ketma-ket tushib qolganlar bitta xato |
| 5+ so'z | \`imlo_katta_hajm_tushibqolgan\` | Katta hajmli tushib qolish |

### INSERTION (Ortiqcha token)

| Token turi | Xato kodi | Izoh |
|-----------|-----------|------|
| Tinish belgisi | \`punkt_ortiqcha_umumiy\` | Ortiqcha tinish belgisi |
| So'z | \`imlo_ortiqcha_guruh\` | Ketma-ket ortiqchalar bitta xato |

### SUBSTITUTION (Almashtirish) — eng murakkab qism

So'z almashtirilganda quyidagi tekshiruvlar ketma-ket amalga oshiriladi:

1. **Grafik xatolar** — \`o'\`/\`o'\` yoki \`g'\`/\`g'\` belgilari almashinuvi
2. **Bosh harf xatosi** — faqat registr farqi bo'lsa
3. **h/x almashinuvi** — \`imlo_h_x_almashinuvi\`
4. **Tutuq belgisi** — tushib qolgan yoki ortiqcha tutuq belgisi
5. **Klaviatura yaqinligi** — yonma-yon tugmalar tufayli yuzaga kelgan xato (jarima koeffitsienti: 0.5)
6. **Umumiy imlo xatosi** — yuqoridagilardan hech biri topilmasa

\`\`\`dart
// Klaviatura yaqinlik matritsasi (QWERTY)
final Map<String, Set<String>> _keyboardAdjacency = {
  'q': {'w', 'a'},
  'w': {'q', 'e', 's', 'a'},
  'e': {'w', 'r', 'd', 's'},
  // ... barcha tugmalar uchun
};
\`\`\`

## Maxsus qoidalar

### Tutuq belgisi tekshiruvi
O'zbek tilida tutuq belgisi (\`'\`) muhim ahamiyatga ega. Tizim quyidagilarni aniqlaydi:
- **Tushib qolgan tutuq belgisi** — \`to'g'ri\` o'rniga \`togri\`
- **Ortiqcha tutuq belgisi** — \`so'z\` o'rniga \`so'z'\`

### Bosh harf qoidasi
Agar ikkita so'z faqat bosh harf bilan farq qilsa (\`Toshkent\` vs \`toshkent\`), bu alohida imloviy xato sifatida qayd etiladi.

### So'zlarni qo'shib/ajratib yozish
- **Qo'shib yozish**: \`"bugun" + "kecha"\` → \`"bugunkecha"\` — \`imlo_sozlar_qoshib_yozilgan\`
- **Ajratib yozish**: \`"bugunkecha"\` → \`"bugun kecha"\` — \`imlo_soz_ajratib_yozilgan\`

### Paronimlar (uslubiy xatolar)
Ma'nosi yaqin, lekin farqli so'zlar:
- \`abzal\` vs \`afzal\`
- \`sher\` vs \`she'r\`
- \`hol\` vs \`xol\`

## "Bir tipdagi xato" qoidasi

Agar bir xil xato bir necha joyda takrorlansa, u **bitta xato** deb hisoblanadi. Masalan, agar foydalanuvchi "Toshkent" so'zini 3 marta "Toshken" deb yozsa — bu 1 ta unikal imlo xatosi.

\`\`\`dart
void _addError(DetectedError error) {
  _detectedErrors.add(error);
  // Unikal xato kodlarini saqlash
  _uniqueErrorCodes[error.type]?.add(error.specificRuleCode);
}
\`\`\`

Baholash **unikal xatolar soni** asosida amalga oshiriladi.

## Katastrofik nomuvofiqlik

Agar foydalanuvchi matni originalga umuman o'xshamasa (masalan, juda qisqa yoki ma'nosiz so'zlar kiritilsa), tizim buni alohida aniqlaydi:

\`\`\`dart
if (userTokens.length <= MAX_GIBBERISH_LENGTH &&
    matchRatio < MIN_MATCH_RATIO_FOR_SIMILARITY) {
  _addError(DetectedError(
    type: ErrorType.IMLO,
    description: 'Matn originalga umuman mos kelmaydi',
    specificRuleCode: 'imlo_katastrofik_nomuvofiqlik',
  ));
  return; // Keyingi tahlil to'xtatiladi
}
\`\`\`

Bu holda avtomatik ravishda **1 baho** (5 ballik) yoki **0 ball** (100 ballik) qo'yiladi.

## Baholash shkalasi

### 5 ballik tizim

| Baho | Imlo xatolari | Umumiy xatolar |
|------|---------------|----------------|
| **5** | 0-1 | 0-1 |
| **4** | 2+ | ≤4 |
| **3** | 2-4 | 4-8 |
| **2** | 5-7 | 8-14 |
| **1** | 7+ yoki katastrofik | 14+ |

### 100 ballik tizim (3-usul)

Har bir aniqlangan xato uchun balldan ayriladi:

| Xato turi | Jarima | Misol |
|-----------|--------|-------|
| Imloviy | **-2.5 ball** | "Toshken" → -2.5 |
| Punktuatsion | **-2.0 ball** | Vergul tushib qolishi → -2.0 |
| Uslubiy | **-1.5 ball** | Paronim xatosi → -1.5 |
| Grafik | **-1.5 ball** | o' belgisi → -1.5 |

\`penaltyMultiplier\` koeffitsienti hisobga olinadi (masalan, klaviatura yaqinligi uchun 0.5).

\`\`\`dart
double evaluate100PointScaleMethod3() {
  double score = 100.0;
  for (var error in _detectedErrors) {
    switch (error.type) {
      case ErrorType.IMLO:
        score -= 2.5 * error.penaltyMultiplier;
        break;
      case ErrorType.PUNKTUATSION:
        score -= 2.0 * error.penaltyMultiplier;
        break;
      case ErrorType.USLUBIY:
        score -= 1.5 * error.penaltyMultiplier;
        break;
      case ErrorType.GRAFIK:
        score -= 1.5 * error.penaltyMultiplier;
        break;
    }
  }
  return score.clamp(0.0, 100.0);
}
\`\`\`

## Xulosa

DiktantEvaluator algoritmi bir necha bosqichli yondashuvdan foydalanadi: tokenizatsiya, normallashtirish, Levenshtein alignment va xatolarni klassifikatsiya qilish. "Bir tipdagi xato" va "katastrofik nomuvofiqlik" kabi maxsus holatlar ham hisobga olinadi. Natija bir nechta baholash usulida chiqariladi.
`;
