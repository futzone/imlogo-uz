import type { Metadata } from 'next';

import AuthProvider from '@/components/app/auth/AuthProvider';

export const metadata: Metadata = {
    title: {
        default: 'Diktant va tez yoziş ilovasi',
        template: '%s | Imlo Go',
    },
    description:
        'Imlo Go ilovasi: audio diktantni eşitib yozing va imlo xatolaringizni avtomatik tekşiring yoki özbekça sözlarda tez yozişni maşq qiling.',
};

/** Ilova (/app) sahifalari uchun umumiy fon: yorug'lik dog'lari va so'nuvchi katak naqsh. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative isolate min-h-dvh text-base">
            <div aria-hidden className="app-backdrop pointer-events-none fixed inset-0 -z-10">
                <div className="bg-grid-pattern absolute inset-0" />
            </div>
            <AuthProvider>{children}</AuthProvider>
        </div>
    );
}
