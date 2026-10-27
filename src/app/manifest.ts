import type { MetadataRoute } from 'next';

import { siteDetails } from '@/data/siteDetails';

/** Telefonda "Bosh ekranga qo'shish" va qidiruvdagi ikonka uchun. */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteDetails.metadata.title,
        short_name: siteDetails.siteName,
        description: siteDetails.metadata.description,
        lang: siteDetails.language,
        start_url: '/app',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#6750A4',
        icons: [
            { src: '/icon.png', sizes: '512x512', type: 'image/png' },
            { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
        ],
    };
}
