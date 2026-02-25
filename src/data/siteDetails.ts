export const siteDetails = {
    siteName: 'Imlo Go',
    siteUrl: 'https://imlogo.uz/',
    metadata: {
        title: 'Imlo Go — O‘zbek tilidagi online diktant va imlo tekshirish platformasi | imlogo.uz',
        description: `Imlo Go — bu O‘zbekiston bo‘yicha birinchi raqamli o‘zbek tili diktant platformasi bo‘lib, foydalanuvchilarga matn yozish, imlo xatolarini aniqlash va o‘rganishni birlashtiradi. Ilova orqali foydalanuvchilar ovozli matn (audio diktant) eshitib, uni yozma shaklda kiritishadi. So‘ng, sun’iy intellekt yordamida yozilgan matn avtomatik tahlil qilinadi, har bir imlo xatosi ko‘rsatiladi va foydalanuvchining saviyasi baholanadi. 
      
      Imlo Go o‘quvchilar, talabalar, o‘qituvchilar, til o‘rganayotganlar va yozma savodxonligini oshirmoqchi bo‘lgan har bir kishi uchun mo‘ljallangan. Ilova foydalanuvchilarga o‘z o‘sishini kuzatish, tarixiy natijalarni ko‘rish va har bir mashg‘ulotdan keyin tahlil olish imkonini beradi. 
      
      Shuningdek, Imlo Go’da real vaqtda ishlaydigan foydalanuvchi interfeysi, zamonaviy va qulay dizayn, mobil va desktop versiyalar mavjud. Platforma doimiy yangilanib boriladi va O‘zbek tilining rivojiga xizmat qiladi. Imlo Go yordamida imlo xatolaringizni yo‘qotish, to‘g‘ri yozishni o‘rganish va diktant orqali til bilimlaringizni mukammallashtirishingiz mumkin. Diktantlar maktab, universitet yoki mustaqil o‘rganish uchun moslashtirilgan.`,
        keywords: [
            'imlo go', 'imlogo.uz', 'oʻzbekcha diktant', 'audio diktant', 'oʻzbek tili ilova',
            'diktant yozish', 'imlo tekshiruvchi', 'oʻzbekcha imlo', 'matn yozish',
            'sun’iy intellekt diktant', 'oʻzbekcha test', 'ta’lim ilovalari',
            'talaba uchun ilova', 'oʻquvchi diktant ilova', 'mobil diktant ilovasi',
        ],
        author: 'Imlo Go Team',
        openGraph: {
            title: 'Imlo Go — O‘zbek tilidagi online diktant ilovasi',
            description: 'Audio eshiting, matn yozing, imlo xatolarni avtomatik aniqlang. Talabalar, o‘quvchilar va o‘qituvchilar uchun zamonaviy o‘zbek diktant platformasi.',
            url: 'https://imlogo.uz',
            image: 'https://imlogo.uz/og-image.jpg',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Imlo Go — O‘zbekcha audio diktant platformasi',
            description: 'Ovozli diktantni eshitib yozing, tizim esa xatolaringizni ko‘rsatib beradi. Til o‘rganishni yangi bosqichga olib chiqing!',
            image: 'https://imlogo.uz/twitter-card.jpg',
        }
    }
    ,
    language: 'uz',
    locale: 'uz-UZ',
    siteLogo: `${process.env.BASE_PATH || ''}/images/logo.png`, // or use a string for the logo e.g. "TechStartup"
    googleAnalyticsId: '', // e.g. G-XXXXXXX,
}