import { MetadataRoute } from 'next';
import { docSections } from '@/data/docs';
import { CONTENT_UPDATED } from '@/lib/seo';
import { directions } from '@/lib/translit/directions';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://imlogo.uz';
    const lastModified = CONTENT_UPDATED;

    const docPages = docSections.map((section) => ({
        url: `${baseUrl}/qollanma/${section.slug}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        // Yangi alifbo haqidagi sahifa — eng ko'p qidiriladigan mavzu.
        priority: section.slug === 'yangi-alifbo' ? 0.9 : 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/app`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/app/tez-yozish`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/app/hamjamiyat`,
            // Reyting har kuni o'zgaradi.
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        ...directions.map(direction => ({
            url: `${baseUrl}/app/translator/${direction.slug}`,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
        {
            url: `${baseUrl}/app/loyiha`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/app/loyiha/ilovalar`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...docPages,
    ];
}
