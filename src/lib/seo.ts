import type { Metadata } from 'next';

import { siteDetails } from '@/data/siteDetails';

const SITE_URL = 'https://imlogo.uz';

/**
 * Sayt matnlari oxirgi marta jiddiy yangilangan sana — sitemap va maqolalardagi
 * `dateModified` uchun. Har build'da yangi sana bersak, qidiruv tizimlari unga ishonmay qo'yadi.
 */
export const CONTENT_UPDATED = '2026-10-27';

interface PageSeo {
    title: string;
    description: string;
    /** Sayt ildiziga nisbatan yo'l, masalan "/app/translator". */
    path: string;
    keywords?: string[];
    /** Qidiruvda ko'rsatilmasin (shaxsiy sahifalar). */
    noindex?: boolean;
}

/**
 * `src/app/opengraph-image.tsx` yasaydigan rasm. Sahifa o'z `openGraph`'ini bersa,
 * Next.js ota bo'limdagi rasmni meros qilib olmaydi — shuning uchun aniq ko'rsatiladi.
 */
const ogImage = { url: '/opengraph-image', width: 1200, height: 630, alt: siteDetails.metadata.openGraph.title };

/**
 * Sahifa metadata'si: sarlavha, tavsif, canonical manzil va ijtimoiy tarmoqlar
 * uchun Open Graph / Twitter kartalari bir xil ma'lumotdan yasaladi.
 */
export const pageMetadata = ({ title, description, path, keywords, noindex }: PageSeo): Metadata => ({
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
        title: `${title} | ${siteDetails.siteName}`,
        description,
        url: path,
        siteName: siteDetails.siteName,
        locale: siteDetails.locale,
        type: 'website',
        images: [ogImage],
    },
    twitter: { card: 'summary_large_image', title: `${title} | ${siteDetails.siteName}`, description, images: [ogImage.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
});

/** Sahifaning "yo'l" zanjiri: bosh sahifadan joriy sahifagacha. */
export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: siteDetails.siteName, path: '' }, ...items].map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
    })),
});

/** Ilova bo'limi (diktant, tez yozish, translator) — bepul veb-ilova sifatida. */
export const webAppLd = ({ name, description, path }: { name: string; description: string; path: string }) => ({
    '@type': 'WebApplication',
    name,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    browserRequirements: 'JavaScript',
    inLanguage: 'uz',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'UZS' },
    publisher: { '@id': `${SITE_URL}/#organization` },
});
