import { IMenuItem } from "@/types";
import { directions } from "@/lib/translit/directions";

interface FooterColumn {
    title: string;
    links: IMenuItem[];
}

export const footerDetails = {
    description: "Özbek tili imlosi uçun oçiq va bepul platforma: audio diktant, özbekça tez yoziş, yangi alifbo translatori va hamjamiyat reytingi.",
    credit: "Loyiha Alişer Navoiy nomidagi Toşkent davlat özbek tili va adabiyoti universiteti «Kompyuter lingvistikasi» yönalişi bitiruvçisi Abdumalikova Gulşoda tomonidan bitiruv malakaviy işi sifatida boşlangan.",
    columns: [
        {
            title: "Platforma",
            links: [
                { text: "Audio diktant", url: "/app" },
                { text: "Tez yoziş", url: "/app/tez-yozish" },
                { text: "Translator", url: "/app/translator" },
                { text: "Hamjamiyat reytingi", url: "/app/hamjamiyat" },
                { text: "Natijalarim", url: "/app/natijalar" },
            ],
        },
        {
            title: "Translator",
            links: directions.map(d => ({ text: d.label, url: `/app/translator/${d.slug}` })),
        },
        {
            title: "Loyiha",
            links: [
                { text: "Qöllanma", url: "/qollanma" },
                { text: "Yangi özbek alifbosi", url: "/qollanma/yangi-alifbo" },
                { text: "Savol-javoblar", url: "/#savollar" },
                { text: "Loyiha haqida", url: "/app/loyiha" },
                { text: "Ilovalarimiz", url: "/app/loyiha/ilovalar" },
            ],
        },
    ] satisfies FooterColumn[],
    telegramChannel: 'https://t.me/imlogo',
    /** Xatolik haqida xabar berish uchun Telegram bot. */
    telegramBot: 'https://t.me/Qahor0v_bot',
};
