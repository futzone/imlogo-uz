import { LuLibrary, LuStar, LuUsers } from "react-icons/lu";

import { IStats } from "@/types";

export const stats: IStats[] = [
    {
        title: "2K+",
        label: "Foydalanuvchi",
        icon: <LuUsers size={22} />,
        description: "Foydalanuvchilarimiz soni har kun, har soat, har daqiqa, har soniya o‘sib bormoqda."
    },
    {
        title: "5.0",
        label: "Baho",
        icon: <LuStar size={22} />,
        description: "Tizimni ishlatib ko‘rganlarning ko‘pchiligi juda yaxshi fikrda."
    },
    {
        title: "Turli",
        label: "Darajalar",
        icon: <LuLibrary size={22} />,
        description: "Katta audio va matn ma’lumotlar bazasi bilan ishlaymiz. Har kuni yangi diktantlar qo‘shamiz."
    }
];
