import DictationList from '@/components/app/dictation/DictationList';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, pageMetadata, webAppLd } from '@/lib/seo';

const title = 'Online audio diktant — imloni tekşiriş';
const description =
    'Özbekça audio diktantni eşitib yozing: Imlo Go xatolarni avtomatik topadi, imloviy, punktuatsion, uslubiy va grafik xatolarga ajratadi hamda 5 va 100 ballik şkalada baholaydi.';

export const metadata = pageMetadata({
    title,
    description,
    path: '/app',
    keywords: ['online diktant', 'o‘zbekcha diktant', 'audio diktant', 'imlo tekshirish', 'diktant yozish'],
});

export default function AppHomePage() {
    return (
        <>
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        webAppLd({ name: 'Imlo Go — audio diktant', description, path: '/app' }),
                        breadcrumbLd([{ name: 'Audio diktant', path: '/app' }]),
                    ],
                }}
            />
            <DictationList />
        </>
    );
}
