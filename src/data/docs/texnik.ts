export const texnikContent = `
# Texnik qo'llanma

Ushbu bo'lim Imlo Go dasturining texnik arxitekturasi, ishlatilgan texnologiyalar va loyiha tuzilishi haqida batafsil ma'lumot beradi.

## Texnologiyalar steki

| Komponent | Texnologiya | Versiya |
|-----------|-------------|---------|
| Framework | Flutter | SDK ^3.6.1 |
| State Management | Riverpod + Hooks | 2.6.1 |
| Mahalliy saqlash | Hive DB | 2.2.3 |
| Audio | audioplayers | 6.4.0 |
| Backend | PocketBase | 0.23.2 |
| UI | Flutter Material | — |
| Markdown | flutter_markdown | 0.7.7 |

## Loyiha strukturasi

\`\`\`
lib/
├── main.dart                          # Ilova kirish nuqtasi
└── src/
    ├── core/
    │   ├── config/
    │   │   ├── app_device.dart        # Qurilma sozlamalari
    │   │   ├── app_fonts.dart         # Shrift belgilanmalari
    │   │   └── app_router.dart        # Navigatsiya yo'naltirish
    │   ├── constants/
    │   │   ├── app_constants.dart     # Ilova doimiylari
    │   │   └── uzbek_constants.dart   # O'zbek tili doimiylari
    │   ├── controllers/
    │   │   └── dictation_controller.dart  # Diktant biznes logikasi
    │   ├── models/
    │   │   ├── detected_error.dart    # Xato modeli
    │   │   ├── error_type.dart        # Xato turi enum
    │   │   ├── evulation_config.dart  # Baholash konfiguratsiyasi
    │   │   ├── text_model.dart        # Diktant matn modeli
    │   │   └── work.dart             # Foydalanuvchi ish natijasi
    │   ├── services/
    │   │   ├── dictation_manager.dart # DiktantEvaluator (854 qator)
    │   │   └── pocketbase_service.dart # PocketBase integratsiya
    │   └── utils/
    │       ├── get_rate_color.dart    # Baho rang yordamchisi
    │       └── time_utils.dart        # Vaqt formatlash
    ├── providers/
    │   ├── app_info_provider.dart     # Ilova ma'lumotlari
    │   ├── dictation_provider.dart    # Diktantlar ro'yxati
    │   └── history_provider.dart      # Tarix provayderi
    └── ui/
        ├── pages/
        │   ├── dictation_page.dart    # Diktant yozish sahifasi
        │   ├── dictation_result_page.dart # Natijalar sahifasi
        │   ├── main_page.dart         # Bosh sahifa
        │   └── results_page.dart      # Tarix sahifasi
        ├── screens/
        │   ├── additional_screens/
        │   │   ├── about_app_screen.dart
        │   │   └── app_info_screen.dart
        │   ├── main_screens/
        │   │   ├── app_bar.dart
        │   │   ├── before_start_screen.dart
        │   │   ├── main_card.dart
        │   │   └── result_card.dart
        │   └── animated_background.dart
        └── widgets/
            ├── app_buttons.dart
            ├── audio_progress_bar.dart
            ├── countdown_widget.dart
            ├── hovered_widget.dart
            └── primary_button.dart
\`\`\`

## Ma'lumotlar modellari

### TextModel — Diktant matni

Diktant ma'lumotlarini ifodalovchi model:

\`\`\`dart
class TextModel {
  final String id;
  final String title;        // Diktant sarlavhasi
  final String text;         // To'liq diktant matni
  final String className;    // Sinf darajasi ("1-sinf")
  final String ageName;      // Yosh toifasi ("7-8 yosh")
  final int length;          // So'zlar soni (avtomatik)
  final int time;            // Davomiyligi (daqiqa)
  final String? url;         // Audio URL (PocketBase)
  final DateTime? createdDate;
}
\`\`\`

### Work — Foydalanuvchi natijasi

Bajarilgan diktant natijasini ifodalovchi model:

\`\`\`dart
class Work {
  String id;                    // Unikal identifikator
  String createdDate;           // ISO 8601 timestamp
  double ball;                  // 100 ballik natija
  double baho;                  // 5 ballik baho
  List<DetectedError> errors;   // Aniqlangan xatolar
  TextModel text;               // Original diktant
  int imloErrorCount;           // Imlo xatolari soni
  int punktuatsionErrorCount;   // Punktuatsion xatolar soni
  int uslubiyErrorCount;        // Uslubiy xatolar soni
  int grafikErrorCount;         // Grafik xatolar soni
  int worktime;                 // Sarflangan vaqt (sekund)
  String input;                 // Foydalanuvchi matni
}
\`\`\`

### DetectedError — Aniqlangan xato

\`\`\`dart
class DetectedError {
  ErrorType type;              // IMLO, PUNKTUATSION, USLUBIY, GRAFIK
  String description;          // Xato tavsifi
  String originalFragment;     // Originaldagi to'g'ri variant
  String userFragment;         // Foydalanuvchi yozgan variant
  String specificRuleCode;     // Unikal qoida identifikatori
  double penaltyMultiplier;    // Jarima koeffitsienti (standart: 1.0)
}
\`\`\`

### ErrorType — Xato turlari

\`\`\`dart
enum ErrorType {
  IMLO,          // "Imloviy" — so'zni noto'g'ri yozish
  PUNKTUATSION,  // "Punktuatsion" — tinish belgilari
  USLUBIY,       // "Uslubiy" — so'z qo'llash
  GRAFIK,        // "Grafik" — harf shakli
}
\`\`\`

## PocketBase integratsiyasi

Backend sifatida **PocketBase** (\`admin.imlogo.uz\`) ishlatiladi. U quyidagi vazifalarni bajaradi:

### Diktantlar kolleksiyasi

\`\`\`dart
class PocketBaseService {
  static const String baseUrl = 'https://admin.imlogo.uz';
  final pb = PocketBase(baseUrl);
}
\`\`\`

Diktantlar \`dictations\` kolleksiyasidan yuklanadi:

\`\`\`dart
final records = await pb.collection('dictations').getList(
  page: page,
  perPage: 20,
);
\`\`\`

Har bir yozuv quyidagi maydonlarni o'z ichiga oladi:
- \`id\`, \`title\`, \`text\` — asosiy ma'lumotlar
- \`class\`, \`age\` — sinf va yosh toifasi
- \`audio\` — audio fayl nomi (PocketBase storage orqali URL ga aylantiriladi)
- \`time\` — davomiyligi

### Audio fayllar
Audio fayllar PocketBase file storage da saqlanadi va URL orqali yuklanadi:
\`\`\`
https://admin.imlogo.uz/api/files/{collectionId}/{recordId}/{fileName}
\`\`\`

## Mahalliy saqlash (Hive DB)

Foydalanuvchi natijalari **Hive** mahalliy ma'lumotlar bazasida saqlanadi:

\`\`\`dart
// Initsializatsiya (main.dart)
await Hive.initFlutter();

// Saqlash
final box = await Hive.openBox('works');
await box.put(work.id, jsonEncode(work.toJson()));

// O'qish
final data = box.get(workId);
final work = Work.fromJson(jsonDecode(data));
\`\`\`

**Afzalliklari:**
- Tez ishlashi — NoSQL, disk-based
- Offline rejimda ham ishlaydi
- Flutter bilan oson integratsiya
- Kichik hajm — foydalanuvchi qurilmasida kam joy egallaydi

## Audio boshqarish

Audio fayllar \`audioplayers\` paketi orqali ijro etiladi:

\`\`\`dart
final AudioPlayer _player = AudioPlayer();

// Audio ijrosi
await _player.play(UrlSource(widget.model.url ?? ""));

// Pozitsiya kuzatish
_player.onPositionChanged.listen((p) {
  setState(() => _position = p);
});

// Tugallash hodisasi
_player.onPlayerComplete.listen((event) {
  setState(() {
    _isPlaying = false;
    _position = Duration.zero;
  });
});
\`\`\`

## Riverpod provayderlar

Ilova holati **Riverpod** state management yordamida boshqariladi:

### dictation_provider
Diktantlar ro'yxatini PocketBase dan yuklaydi va sahifalash (pagination) bilan boshqaradi.

### history_provider
Hive dan saqlangan natijalarni yuklaydi va boshqaradi. Yangi natijalarni saqlash va eski natijalarni o'chirish funksiyalari mavjud.

### app_info_provider
Ilova versiyasi va boshqa umumiy ma'lumotlarni boshqaradi.

## Ilova oqimi

\`\`\`
MainPage (Diktantlar ro'yxati)
    ↓ Diktant tanlash
BeforeStartScreen (Tayyorgarlik)
    ↓ "Boshlash" tugmasi
DictationPage (Audio + Matn kiritish)
    ↓ "Tekshirish" tugmasi
DiktantEvaluator (Tahlil va baholash)
    ↓ Natija
DictationResultPage (Baho + Xatolar)
    ↓ "Saqlash" tugmasi
Hive DB (Mahalliy saqlash)
\`\`\`

## Rivojlantirish muhiti

### Talablar
- Flutter SDK ^3.6.1
- Dart SDK (Flutter bilan birga keladi)
- Android Studio yoki VS Code (Flutter plaginlari bilan)
- PocketBase server (backend uchun)

### Ishga tushirish

\`\`\`bash
# Bog'liqliklarni o'rnatish
flutter pub get

# Ilovani ishga tushirish (debug rejimda)
flutter run

# Web versiyani ishga tushirish
flutter run -d chrome

# Windows versiyani build qilish
flutter build windows

# Android APK build qilish
flutter build apk
\`\`\`
`;
