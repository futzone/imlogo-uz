import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import TranslatorView from '@/components/app/translator/TranslatorView';
import { directionBySlug, directions } from '@/lib/translit/directions';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, pageMetadata, webAppLd } from '@/lib/seo';

interface Props {
    params: { yonalish: string };
}

export const dynamicParams = false;

export const generateStaticParams = () => directions.map(d => ({ yonalish: d.slug }));

/** Har bir yo'nalish uchun qidiruvda ishlatiladigan iboralar. */
const keywordsFor: Record<string, string[]> = {
    'yangi-lotin': ['yangi alifbodan lotinga', 'yangi alifbo eski lotin'],
    'yangi-kirill': ['yangi alifbodan kirillga', 'yangi lotindan kirillga'],
    'lotin-yangi': ['yangi alifboga o‘girish', 'lotindan yangi alifboga', 'yangi o‘zbek alifbosi', 'Ş Ç Ö Ğ'],
    'kirill-yangi': ['kirilldan yangi alifboga', 'krilldan yangi lotinga'],
    'kirill-lotin': ['kirilldan lotinga', 'krilldan lotinga o‘girish', 'kirill lotin translator'],
    'lotin-kirill': ['lotindan kirillga', 'lotindan krillga o‘girish', 'lotin kirill translator'],
};

const describe = (title: string) =>
    `${title}: özbekça matnni kirill, amaldagi lotin va yangi lotin (Ş, Ç, Ö, Ğ) alifbolari orasida bepul va bir zumda ögiring. Ishoq, ashob, компьютер kabi istisnolar luğat asosida töğri çiqadi.`;

export const generateMetadata = ({ params }: Props): Metadata => {
    const direction = directionBySlug(params.yonalish);
    if (!direction) return {};
    return pageMetadata({
        title: `${direction.title} — onlayn translator`,
        description: describe(direction.title),
        path: `/app/translator/${direction.slug}`,
        keywords: ['o‘zbekcha transliteratsiya', 'translator', ...(keywordsFor[direction.slug] ?? [])],
    });
};

export default function TranslatorPage({ params }: Props) {
    const direction = directionBySlug(params.yonalish);
    if (!direction) notFound();
    const path = `/app/translator/${direction.slug}`;
    return (
        <>
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        webAppLd({ name: `Imlo Go — ${direction.label} translator`, description: describe(direction.title), path }),
                        breadcrumbLd([
                            { name: 'Translator', path: '/app/translator' },
                            { name: direction.label, path },
                        ]),
                    ],
                }}
            />
            <TranslatorView direction={direction} />
        </>
    );
}
