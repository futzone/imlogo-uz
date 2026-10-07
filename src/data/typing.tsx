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
    eyebrow: "Yangi modul",
    title: "Tez yozishni",
    accent: "o‘zbekcha so‘zlarda mashq qiling",
    description:
        "Ekranga chiqqan o‘zbekcha so‘zlarni iloji boricha tez va xatosiz tering. Har bir harf yozish jarayonida tekshiriladi, mashq oxirida esa tezligingiz va aniqligingiz ko‘rsatiladi.",
    bullets: [
        {
            title: "Vaqt yoki so‘zlar soni bo‘yicha",
            description: "15, 30, 60 yoki 120 soniyalik mashqni yoxud 10, 25, 50, 100 ta so‘zdan iborat to‘plamni tanlang.",
            icon: <LuKeyboard size={24} />,
        },
        {
            title: "Tezlik va aniqlik",
            description: "Daqiqasiga nechta so‘z (WPM) terganingiz, aniqlik foizi hamda to‘g‘ri va xato belgilar soni hisoblanadi.",
            icon: <LuGauge size={24} />,
        },
        {
            title: "O‘sishni kuzatish",
            description: "Har bir mashq natijasi saqlanadi — eng yaxshi ko‘rsatkichingizni va tezligingiz grafigini kuzatib boring.",
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
