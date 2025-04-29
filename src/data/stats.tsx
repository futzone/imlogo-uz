import { BsBarChartFill, BsFillStarFill } from "react-icons/bs";
import { PiGlobeFill } from "react-icons/pi";

import { IStats } from "@/types";

export const stats: IStats[] = [
    {
        title: "2K+",
        icon: <BsBarChartFill size={34} className="text-blue-500" />,
        description: "Foydalanuvchilarimiz soni har kun, har soat, har daqiqa, har soniya, o'sib bormoqda."
    },
    {
        title: "5.0",
        icon: <BsFillStarFill size={34} className="text-yellow-500" />,
        description: "Tizimni ishlatib ko'rganlarning ko'pchiligi juda yaxshi fikrda."
    },
    {
        title: "200+ ",
        icon: <PiGlobeFill size={34} className="text-green-600" />,
        description: "Katta audio va matn ma'lumotlar bazasi bilan ishlaymiz. Har kuni yangi diktantlar qo'shamiz."
    }
];