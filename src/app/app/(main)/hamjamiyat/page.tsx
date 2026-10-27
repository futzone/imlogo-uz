import CommunityView from '@/components/app/community/CommunityView';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    title: 'Hamjamiyat reytingi va haftalik musobaqa',
    description:
        'Imlo Go hamjamiyati: özbekça tez yoziş va diktant böyiça eng tez, eng faol va eng savodli foydalanuvçilar. Har duşanba yangi haftalik musobaqa.',
    path: '/app/hamjamiyat',
});

export default function CommunityPage() {
    return (
        <>
            <JsonLd data={{ '@context': 'https://schema.org', ...breadcrumbLd([{ name: 'Hamjamiyat', path: '/app/hamjamiyat' }]) }} />
            <CommunityView />
        </>
    );
}
