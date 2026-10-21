import AppHeader from '@/components/app/AppHeader';
import CelebrationBanner from '@/components/celebration/CelebrationBanner';

/** Ilovaning bosh sahifalari: bo'limlar ("Diktant", "Tez yozish") almashtirgichi bilan. */
export default function AppMainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col pb-20 md:pb-0">
            <AppHeader />
            <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
                <CelebrationBanner className="mt-4" showCta={false} />
            </div>
            <main className="flex flex-1 flex-col">{children}</main>
        </div>
    );
}
