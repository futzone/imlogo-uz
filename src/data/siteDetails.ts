export const siteDetails = {
    siteName: 'Imlo Go',
    siteUrl: 'https://imlogo.uz/',
    telegramChannel: 'https://t.me/imlogo',
    metadata: {
        title: 'Imlo Go — özbekça diktant, tez yoziş va yangi alifbo translatori',
        description: 'Imlo Go — özbek tili imlosi uçun bepul platforma: audio diktantni avtomatik tekşiriş, özbekça tez yoziş maşqi, kirill, lotin va yangi alifbo (Ş, Ç, Ö, Ğ) orasida translator hamda hamjamiyat reytingi.',
        keywords: [
            'imlo go', 'imlogo', 'o‘zbekcha diktant', 'online diktant', 'audio diktant', 'imlo tekshirish',
            'o‘zbek tili imlosi', 'yangi o‘zbek alifbosi', 'yangi alifbo', 'Ş Ç Ö Ğ', 'kirilldan lotinga',
            'lotindan kirillga', 'krill lotin translator', 'o‘zbekcha transliteratsiya', 'yangi alifboga o‘girish',
            'tez yozish', 'o‘zbekcha tez yozish', 'klaviaturada tez yozish', 'wpm test', 'typing test uzbek',
        ],
        author: 'Imlo Go Team',
        openGraph: {
            title: 'Imlo Go — özbek tili imlosi uçun bepul platforma',
            description: 'Audio diktant, özbekça tez yoziş va kirill · lotin · yangi alifbo translatori. Natijalaringizni kuzating va hamjamiyat bilan bellaşing.',
        },
        twitter: {
            title: 'Imlo Go — özbek tili imlosi uçun bepul platforma',
            description: 'Audio diktant, tez yoziş maşqi va yangi alifbo translatori — barçasi bepul.',
        },
    },
    language: 'uz',
    locale: 'uz_UZ',
    siteLogo: `${process.env.BASE_PATH || ''}/images/logo.svg`,
    googleAnalyticsId: '', // e.g. G-XXXXXXX,
}