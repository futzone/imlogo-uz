import { ITestimonial } from "@/types";
import { siteDetails } from "./siteDetails";

export const testimonials: ITestimonial[] = [
    {
        name: 'Abdurazzoqov Hasanjon',
        role: 'SMM Manager, CEO',
        message: `${siteDetails.siteName} ona tilimizning rivoji uchun katta ahamiyatga ega dasturlar yaratilishining birinchi bosqichidagi ilovadir. Agar imlo qoidalariga rioya qilishni o'rgansak, qolgan me'zonlarni yaxshilash oson kechadi.`,
        avatar: '/images/testimonial-1.webp',
    },
    {
        name: 'Lisa Kalashnikova',
        role: 'LLM, NLP Engineer at META',
        message: `O'zbekiston yoshlarining o'zbek tilini raqamli dunyoda ham rivojlantirishga harakat qilishi bu juda katta yutuq. ${siteDetails.siteName} loyihasi kichik bo'lsa-da bunga yaqqol isbot bo'la oladi. To'xtamang Imlo Go team!`,
        avatar: '/images/testimonial-2.webp',
    },
    {
        name: 'Emily Johnson',
        role: 'Central Asia Reasearcher',
        message: `Zamonaviy dunyoda butun boshli tarix, til ham juda tez yo'qolib bormoqda. Imlo Go kabi mamlakat ona tilini rivojlantirishga qaratilgan dasturlar bu yo'qolib ketishlarga qarshi chiqibgina qolmay, tilni targ'ib qilishga ham katta yordam beradi.`,
        avatar: '/images/testimonial-3.webp',
    },
];