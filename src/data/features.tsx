import { LuCloud, LuFlame, LuKeyboard, LuLanguages, LuTrophy } from "react-icons/lu";

export interface IFeature {
    title: string;
    description: string;
    icon: React.ReactElement<{ size?: number }>;
    href: string;
    /** Bento to'rida keng karta. */
    wide?: boolean;
    tag?: string;
}

/** Landingdagi "Yangi imkoniyatlar" bo'limi. */
export const newFeatures: IFeature[] = [
    {
        title: "Translator: kirill, lotin va yangi alifbo",
        description: "Matnni 6 ta yönalişda bir zumda ögiring. Ishoq, ashob, компьютер, цирк kabi istisnolar 3 mingdan ortiq sözli luğat asosida töğri çiqadi.",
        icon: <LuLanguages size={24} />,
        href: "/app/translator",
        wide: true,
        tag: "Yangi alifbo",
    },
    {
        title: "Tez yoziş — uç yozuvda",
        description: "Eski lotin, yangi lotin yoki kirillda maşq qiling. Ş, Ç, Ö, Ğ ni oddiy klaviaturada sh, ch, o‘, g‘ deb terasiz.",
        icon: <LuKeyboard size={24} />,
        href: "/app/tez-yozish",
    },
    {
        title: "Hamjamiyat va haftalik musobaqa",
        description: "Eng tez, eng faol va eng savodli foydalanuvçilar reytingi. Har duşanba yangi hafta, ötgan hafta ğoliblari esa sahifada.",
        icon: <LuTrophy size={24} />,
        href: "/app/hamjamiyat",
    },
    {
        title: "Ketma-ket kunlar va ösiş grafigi",
        description: "Har kuni maşq qiling — streak ösib boradi. Profilda tezligingiz qanday ösayotganini grafikda körasiz.",
        icon: <LuFlame size={24} />,
        href: "/app/profil",
    },
    {
        title: "Natijalar istalgan qurilmada",
        description: "Google yoki email orqali kiring — diktant va tez yoziş natijalaringiz telefon va kompyuter orasida sinxronlanadi. Kiriş majburiy emas.",
        icon: <LuCloud size={24} />,
        href: "/app/natijalar",
    },
];
