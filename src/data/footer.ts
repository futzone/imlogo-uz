import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
    subheading: string;
    quickLinks: IMenuItem[];
    email: string;
    telephone: string;
    socials: ISocials;
} = {
    subheading: "Loyiha Alisher Navoiy nomidagi Toshkent davlat o'zbek tili va adabiyoti universiteti, «Kompyuter lingvistikasi» yo'nalishi bitiruvchi kurs talabasi Abdumalikova Gulshoda tomonidan bitiruv malakaviy ishi sifatida tayyorlandi.",
    quickLinks: [
        {
            text: "Dastur haqida",
            url: "#features"
        },
        {
            text: "Fikrlar",
            url: "#testimonials"
        }
    ],
    email: 'abdumalikovagulshoda2403@gmail.com',
    telephone: '+99899999999',
    socials: {
        // github: 'https://github.com',
        // x: 'https://twitter.com/x',
        twitter: 'https://twitter.com/Twitter',
        facebook: 'https://facebook.com',
        // youtube: 'https://youtube.com',
        linkedin: 'https://www.linkedin.com',
        // threads: 'https://www.threads.net',
        instagram: 'https://www.instagram.com',
    }
}