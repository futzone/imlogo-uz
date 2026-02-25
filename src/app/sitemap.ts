import { MetadataRoute } from 'next';
import { docSections } from '@/data/docs';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://imlogo.uz';

    const docPages = docSections.map((section) => ({
        url: `${baseUrl}/qollanma/${section.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/qollanma`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        ...docPages,
    ];
}
