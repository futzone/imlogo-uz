import { LuLibrary, LuStar, LuUsers } from "react-icons/lu";

import { IStats } from "@/types";

export const stats: IStats[] = [
    {
        title: "2K+",
        label: "Foydalanuvçi",
        icon: <LuUsers size={22} />,
        description: "Foydalanuvçilarimiz soni har kun, har soat, har daqiqa, har soniya ösib bormoqda."
    },
    {
        title: "5.0",
        label: "Baho",
        icon: <LuStar size={22} />,
        description: "Tizimni işlatib körganlarning köpçiligi juda yaxşi fikrda."
    },
    {
        title: "Turli",
        label: "Darajalar",
        icon: <LuLibrary size={22} />,
        description: "Katta audio va matn ma’lumotlar bazasi bilan işlaymiz. Har kuni yangi diktantlar qöşamiz."
    }
];
