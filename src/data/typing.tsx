import { LuGauge, LuKeyboard, LuLineChart } from "react-icons/lu";

import { IBenefitBullet } from "@/types";

export const typingDetails: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    bullets: IBenefitBullet[];
    appUrl: string;
} = {
    eyebrow: "Tez yoziş",
    title: "Tez yozişni",
    accent: "özbekça sözlarda maşq qiling",
    description:
        "Ekranga çiqqan özbekça sözlarni iloji boriça tez va xatosiz tering — eski lotin, yangi alifbo yoki kirillda. Har bir harf yoziş jarayonida tekşiriladi, maşq oxirida esa tezligingiz va aniqligingiz körsatiladi.",
    bullets: [
        {
            title: "Vaqt yoki sözlar soni böyiça",
            description: "15, 30, 60 yoki 120 soniyalik maşqni yoxud 10, 25, 50, 100 ta sözdan iborat töplamni tanlang.",
            icon: <LuKeyboard size={24} />,
        },
        {
            title: "Tezlik va aniqlik",
            description: "Daqiqasiga neçta söz (WPM) terganingiz, aniqlik foizi hamda töğri va xato belgilar soni hisoblanadi.",
            icon: <LuGauge size={24} />,
        },
        {
            title: "Reyting va ösiş",
            description: "Natijalaringiz saqlanadi, profilda tezlik ösişi grafigi körinadi, hamjamiyat reytingida esa boşqalar bilan bellaşasiz.",
            icon: <LuLineChart size={24} />,
        },
    ],
    appUrl: "/app/tez-yozish",
};

/** Sahifadagi namoyish (demo) uchun qisqa so‘zlar to‘plami */
export const demoWords: string[] = [
    "va", "bu", "bir", "bilan", "uchun", "ham", "biz", "siz", "juda", "yaxshi",
    "katta", "yangi", "kitob", "maktab", "bilim", "til", "so'z", "harf", "imlo", "diktant",
    "o'zbek", "vatan", "do'st", "oila", "bola", "ona", "ota", "shahar", "qishloq", "bog'",
    "tog'", "daryo", "quyosh", "osmon", "bahor", "yoz", "kuz", "qish", "kun", "tun",
    "vaqt", "hayot", "orzu", "maqsad", "baxt", "mehr", "to'g'ri", "tez", "oson", "muhim",
    "o'qimoq", "yozmoq", "bilmoq", "o'rganmoq", "ma'no", "san'at", "she'r", "e'tibor", "ko'ngil", "yurak",
];
