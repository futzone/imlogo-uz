import {
    LuAward,
    LuGraduationCap,
    LuHeadphones,
    LuHistory,
    LuPenLine,
    LuPresentation,
    LuSpellCheck,
    LuTarget,
    LuZap,
} from "react-icons/lu";

import { IBenefit } from "@/types"

export const benefits: IBenefit[] = [
    {
        title: "Diktant yoziş qanday işlaydi?",
        description: "Audio eşitasiz, matnni yozasiz, tizim esa imlo xatolarni avtomatik tekşiradi. Natijani darhol körib çiqasiz.",
        bullets: [
            {
                title: "Eşitiş",
                description: "Diktant audio faylini tinglang va diqqat bilan esda saqlang — har bir söz muhim.",
                icon: <LuHeadphones size={24} />
            },
            {
                title: "Yoziş",
                description: "Eşitgan matningizni ilovadagi maxsus maydonga yozing — töğri yozuvga e’tibor bering.",
                icon: <LuPenLine size={24} />
            },
            {
                title: "Tekşiruv",
                description: "Tizim siz yozgan matnni avtomatik tahlil qiladi va imlo xatolarni körsatadi — natijani bir zumda körasiz.",
                icon: <LuZap size={24} />
            }
        ],
        imageSrc: "/images/Screenshot 2025-05-03 002154-portrait.webp"
    },

    {
        title: "Asosiy imkoniyatlar",
        description: "Özbek tilidagi turli matnlardan tayyorlangan audio diktantlar orqali eşitiş va yoziş könikmalaringizni mustahkamlang.",
        bullets: [
            {
                title: "Imlo xatolarni aniqlaş",
                description: "Yozgan matningiz avtomatik tarzda tekşiriladi va imloviy xatolar aniq körsatiladi.",
                icon: <LuSpellCheck size={24} />
            },
            {
                title: "Baholaş tizimi",
                description: "Natijalaringiz ballar orqali baholanadi — aniqlik, tezlik va xato darajasi hisobga olinadi.",
                icon: <LuAward size={24} />
            },
            {
                title: "Harakat tarixini köriş",
                description: "Oldingi diktantlaringizni, xatolar tarixini va yutuqlaringizni kuzatib boring.",
                icon: <LuHistory size={24} />
            }
        ],
        imageSrc: "/images/Screenshot 2025-05-03 000456-portrait.webp"
    },
    {
        title: "Bu kimlar uçun?",
        description: "«Imlo Go» tizimining foydalanuvçilari: talabalar, öquvçilar, öqituvçilar va boşqa istalgan odam!",
        bullets: [
            {
                title: "Öquvçilar va talabalar",
                description: "Imlo könikmalarini mustahkamlaş, darslarga tayyorlaniş va bilimni mustahkamlaş uçun ideal vosita.",
                icon: <LuGraduationCap size={24} />
            },
            {
                title: "Öqituvçilar",
                description: "Dars jarayonida qöllaş, uy vazifasi sifatida beriş va imloviy tahlilni avtomatlaştiriş imkoniyati.",
                icon: <LuPresentation size={24} />
            },
            {
                title: "Özini sinamoqçi bölganlar",
                description: "Imlo böyiça öz ustida işlayotgan, nutq va yozuvni töğrilaşni xohlaydigan har bir inson uçun foydali.",
                icon: <LuTarget size={24} />
            }
        ],
        imageSrc: "/images/Screenshot 2025-05-03 002442-portrait.webp"
    },
]
