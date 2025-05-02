import { FiBarChart2, FiBriefcase, FiDollarSign, FiLock, FiPieChart, FiShield, FiTarget, FiTrendingUp, FiUser } from "react-icons/fi";

import { IBenefit } from "@/types"

export const benefits: IBenefit[] = [
    {
        title: "Diktant yozish qanday ishlaydi?",
        description: "Audio eshitasiz, matnni yozasiz, tizim esa imlo xatolarni avtomatik tekshiradi. Natijani darhol ko‘rib chiqasiz.",
        bullets: [
            {
                title: "Eshitish",
                description: "Diktant audio faylini tinglang va diqqat bilan esda saqlang — har bir so‘z muhim.",
                icon: <FiBarChart2 size={26} />
            },
            {
                title: "Yozish",
                description: "Eshitgan matningizni ilovadagi maxsus maydonga yozing — to‘g‘ri yozuvga e’tibor bering.",
                icon: <FiTarget size={26} />
            },
            {
                title: "Tekshiruv",
                description: "Tizim siz yozgan matnni avtomatik tahlil qiladi va imlo xatolarni ko‘rsatadi — natijani bir zumda ko‘rasiz.",
                icon: <FiTrendingUp size={26} />
            }
        ],
        imageSrc: "/images/Screenshot 2025-05-03 002154-portrait.webp"
    },

    {
        title: "Asosiy imkoniyatlar",
        description: "O‘zbek tilidagi turli matnlardan tayyorlangan audio diktantlar orqali eshitish va yozish ko‘nikmalaringizni mustahkamlang.",
        bullets: [
            {
                title: "Imlo xatolarni aniqlash",
                description: "Yozgan matningiz avtomatik tarzda tekshiriladi va imloviy xatolar aniq ko‘rsatiladi.",
                icon: <FiLock size={26} />
            },
            {
                title: " Baholash tizimi",
                description: "Natijalaringiz ballar orqali baholanadi — aniqlik, tezlik va xato darajasi hisobga olinadi.",
                icon: <FiUser size={26} />
            },
            {
                title: "Harakat tarixini ko‘rish",
                description: "Oldingi diktantlaringizni, xatolar tarixini va yutuqlaringizni kuzatib boring.",
                icon: <FiShield size={26} />
            }
        ],
        imageSrc: "/images/Screenshot 2025-05-03 000456-portrait.webp"
    },
    {
        title: "Bu kimlar uchun?",
        description: "«Imlo Go» tizimining foydalanuvchilari: talabalar, o'quvchilar, o'qituvchilar va boshqa istalgan odam!",
        bullets: [
            {
                title: "O‘quvchilar va Talabalar",
                description: "Imlo ko‘nikmalarini mustahkamlash, darslarga tayyorlanish va bilimni mustahkamlash uchun ideal vosita.",
                icon: <FiDollarSign size={26} />
            },
            {
                title: "O‘qituvchilar",
                description: "Dars jarayonida qo‘llash, uy vazifasi sifatida berish va imloviy tahlilni avtomatlashtirish imkoniyati.",
                icon: <FiBriefcase size={26} />
            },
            {
                title: "O‘zini sinamoqchi bo‘lganlar",
                description: "Imlo bo‘yicha o‘z ustida ishlayotgan, nutq va yozuvni to‘g‘rilashni xohlaydigan har bir inson uchun foydali.",
                icon: <FiPieChart size={26} />
            }
        ],
        imageSrc: "/images/Screenshot 2025-05-03 002442-portrait.webp"
    },
]