import TypingView from '@/components/app/typing/TypingView';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, pageMetadata, webAppLd } from '@/lib/seo';

const description =
    'Özbekça sözlarda klaviaturada tez yozişni maşq qiling: eski lotin, yangi alifbo (Ş, Ç, Ö, Ğ) yoki kirillda. Daqiqasiga söz (WPM), aniqlik, tezlik grafigi va reyting.';

export const metadata = pageMetadata({
    title: 'Özbekça tez yoziş maşqi (WPM test)',
    description,
    path: '/app/tez-yozish',
    keywords: ['tez yozish', 'o‘zbekcha tez yozish', 'typing test', 'wpm', 'klaviatura mashqi', 'yangi alifboda yozish'],
});

export default function TypingPage() {
    return (
        <>
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        webAppLd({ name: 'Imlo Go — özbekça tez yoziş maşqi', description, path: '/app/tez-yozish' }),
                        breadcrumbLd([{ name: 'Tez yoziş', path: '/app/tez-yozish' }]),
                    ],
                }}
            />
            <TypingView />
        </>
    );
}
