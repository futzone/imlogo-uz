/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            // Eski qo'llanma manzili qidiruv tizimlaridagi havolalar uchun saqlanadi.
            { source: '/qollanma/foydalanish', destination: '/qollanma/boshlash', permanent: true },
            // Bo'lim sahifalari birinchi ichki sahifaga doimiy yo'naltiriladi (307 emas, 308),
            // shunda qidiruv tizimlari kuchni yakuniy manzilga beradi.
            { source: '/qollanma', destination: '/qollanma/boshlash', permanent: true },
            { source: '/app/translator', destination: '/app/translator/lotin-yangi', permanent: true },
        ];
    },
};

export default nextConfig;
