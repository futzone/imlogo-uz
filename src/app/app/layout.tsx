import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        default: 'Diktant va tez yozish ilovasi',
        template: '%s | Imlo Go',
    },
    description:
        'Imlo Go ilovasi: audio diktantni eshitib yozing va imlo xatolaringizni avtomatik tekshiring yoki o‘zbekcha so‘zlarda tez yozishni mashq qiling.',
    alternates: { canonical: '/app' },
};

/** Ilova (/app) sahifalari uchun umumiy fon: yorug'lik dog'lari va so'nuvchi katak naqsh. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative isolate min-h-dvh text-base">
            <div aria-hidden className="app-backdrop pointer-events-none fixed inset-0 -z-10">
                <div className="bg-grid-pattern absolute inset-0" />
            </div>
            {children}
        </div>
    );
}
