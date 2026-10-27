import { IFAQ } from "@/types";

/** Landingdagi "Savol-javoblar" bo'limi va FAQPage tuzilmaviy ma'lumoti (SEO) uchun. */
export const faqs: IFAQ[] = [
    {
        question: "Imlo Go bepulmi?",
        answer: "Ha. Diktant, tez yoziş maşqi, translator va reyting — barçasi bepul. Röyxatdan ötmasdan ham töliq foydalaniş mumkin.",
    },
    {
        question: "Yangi özbek alifbosida nima özgaradi?",
        answer: "Törtta harf yangi şaklga ötadi: Oʻ → Ö, Gʻ → Ğ, Sh → Ş, Ch → Ç. «ng» esa mustaqil harf sifatida alifbodan çiqariladi — n va g alohida yoziladi (tong, singil).",
    },
    {
        question: "Kirill matnini lotin yoki yangi alifboga qanday ögiraman?",
        answer: "Translator bölimida matnni kiriting va yönalişni tanlang: kirill, amaldagi lotin va yangi lotin orasida 6 ta yönaliş bor. Natija yoziş bilan bir vaqtda çiqadi, uni nusxalaş yoki .txt fayl qilib yuklab oliş mumkin.",
    },
    {
        question: "«Ishoq», «ashob» kabi sözlar töğri ögiriladimi?",
        answer: "Ha. Bu sözlarda «sh» bitta harf emas, alohida s va h tovuşlari. Translator 3 mingdan ortiq istisno sözlar luğatidan foydalanadi: Ishoq yangi alifboda ham Ishoq bölib qoladi, «shahar» esa «şahar» böladi. Kirillga ögirişda компьютер, цирк, район kabi sözlar ham töğri tiklanadi.",
    },
    {
        question: "Klaviaturamda Ş, Ç, Ö, Ğ harflari yöq. Qanday yozaman?",
        answer: "Tez yoziş maşqida bu harflarni odatdagidek «sh», «ch», «o‘», «g‘» deb terişingiz mumkin — tizim ularni avtomatik yangi harfga aylantiradi. Translatorda esa maxsus tugmalar orqali qöyiladi.",
    },
    {
        question: "Diktant qanday baholanadi?",
        answer: "Yozgan matningiz asl matn bilan sözma-söz soliştiriladi va xatolar tört turga ajratiladi: imloviy, punktuatsion, uslubiy va grafik. Natija 5 ballik baho va 100 ballik şkalada körsatiladi, har bir xato izohi bilan.",
    },
    {
        question: "Hisob oçiş nima beradi?",
        answer: "Google yoki email orqali kirsangiz, diktant va tez yoziş natijalaringiz istalgan qurilmada saqlanadi, hamjamiyat reytingi va haftalik musobaqada qatnaşasiz, profilingizda tezlik ösişi grafigi va ketma-ket kunlar (streak) körinadi.",
    },
    {
        question: "Haftalik musobaqa qanday ötadi?",
        answer: "Har duşanba 00:00 da (Toşkent vaqti) yangi hafta boşlanadi. Hafta davomida tez yoziş va diktant natijalari alohida reytingda hisoblanadi, ötgan hafta ğoliblari esa Hamjamiyat sahifasida körsatiladi.",
    },
    {
        question: "Telefon yoki kompyuter uçun ilova bormi?",
        answer: "Ha — Android, iOS va Windows uçun ilovalar bor. Brauzer versiyasi esa heç narsa örnatmasdan istalgan qurilmada işlaydi.",
    },
];
