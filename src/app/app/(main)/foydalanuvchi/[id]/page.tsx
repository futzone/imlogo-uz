import type { Metadata } from 'next';

import PublicProfileView from '@/components/app/profile/PublicProfileView';

export const metadata: Metadata = {
    title: 'Foydalanuvçi profili',
    robots: { index: false },
};

export default function UserProfilePage({ params }: { params: { id: string } }) {
    return <PublicProfileView userId={decodeURIComponent(params.id)} />;
}
