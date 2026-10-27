import { faqs } from '@/data/faq';
import { boshlashContent } from './boshlash';
import { diktantContent } from './diktant';
import { hamjamiyatContent } from './hamjamiyat';
import { qandayIshlaydiContent } from './qanday-ishlaydi';
import { texnikContent } from './texnik';
import { tezYozishContent } from './tez-yozish';
import { translatorContent } from './translator';
import { yangiAlifboContent } from './yangi-alifbo';

export interface DocSection {
    slug: string;
    title: string;
    /** Sahifa tavsifi: sarlavha ostida va qidiruv natijalarida ko'rinadi. */
    description: string;
    group: string;
    /** Markdown (sarlavhasiz — sarlavha sahifaning o'zida chiqadi). */
    content: string;
}

const savollarContent = faqs.map(faq => `## ${faq.question}\n\n${faq.answer}`).join('\n\n');

export const docSections: DocSection[] = [
    {
        slug: 'boshlash',
        title: 'Boşlaş',
        description: 'Imlo Go nima, qaysi qurilmalarda işlaydi, hisob nima beradi va natijalar qayerda saqlanadi.',
        group: 'Boşlaş',
        content: boshlashContent,
    },
    {
        slug: 'savollar',
        title: 'Savol-javoblar',
        description: 'Imlo Go, yangi alifbo, translator, diktant va reyting haqida köp beriladigan savollarga javoblar.',
        group: 'Boşlaş',
        content: savollarContent,
    },
    {
        slug: 'diktant',
        title: 'Diktant',
        description: 'Audio diktantni tanlaş, yoziş, xato turlari va natijalar tarixi.',
        group: 'Bölimlar',
        content: diktantContent,
    },
    {
        slug: 'tez-yozish',
        title: 'Tez yoziş',
        description: 'Özbekça tez yoziş maşqi: eski, yangi lotin va kirill yozuvlari, Ş Ç Ö Ğ ni oddiy klaviaturada teriş, WPM va aniqlik.',
        group: 'Bölimlar',
        content: tezYozishContent,
    },
    {
        slug: 'translator',
        title: 'Translator',
        description: 'Kirill, amaldagi lotin va yangi alifbo orasida ögiriş: 6 yönaliş, istisnolar luğati va transliteratsiya qoidalari.',
        group: 'Bölimlar',
        content: translatorContent,
    },
    {
        slug: 'hamjamiyat',
        title: 'Hisob va hamjamiyat',
        description: 'Reytinglar, haftalik musobaqa, ketma-ket kunlar (streak), profil va murojaat qoldiriş.',
        group: 'Bölimlar',
        content: hamjamiyatContent,
    },
    {
        slug: 'yangi-alifbo',
        title: 'Yangi özbek alifbosi',
        description: 'Yangi özbek lotin alifbosi: Oʻ → Ö, Gʻ → Ğ, Sh → Ş, Ch → Ç, «ng» harfining çiqarilişi, misollar va yangi alifboga ötiş.',
        group: 'Yangi alifbo',
        content: yangiAlifboContent,
    },
    {
        slug: 'qanday-ishlaydi',
        title: 'Diktant qanday baholanadi',
        description: 'Diktantni tekşiruvçi algoritm: tokenizatsiya, Levenshtein alignment, xatolarni turlarga ajratiş va baholaş şkalasi.',
        group: 'Texnik',
        content: qandayIshlaydiContent,
    },
    {
        slug: 'texnik',
        title: 'Texnik qöllanma',
        description: 'Imlo Go arxitekturasi: Next.js veb-sayt, Flutter ilova, PocketBase kolleksiyalari va transliteratsiya luğati.',
        group: 'Texnik',
        content: texnikContent,
    },
];

export const docGroups = Array.from(new Set(docSections.map(section => section.group)));

export const getDocSection = (slug: string): DocSection | undefined => docSections.find(s => s.slug === slug);
