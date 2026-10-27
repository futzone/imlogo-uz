import type { Metadata } from 'next';

import ProfileView from '@/components/app/profile/ProfileView';

export const metadata: Metadata = {
    title: 'Profil',
    robots: { index: false },
};

export default function ProfilePage() {
    return <ProfileView />;
}
