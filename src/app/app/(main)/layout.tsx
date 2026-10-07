import AppHeader from '@/components/app/AppHeader';

/** Ilovaning bosh sahifalari: bo'limlar ("Diktant", "Tez yozish") almashtirgichi bilan. */
export default function AppMainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col pb-20 md:pb-0">
            <AppHeader />
            <main className="flex flex-1 flex-col">{children}</main>
        </div>
    );
}
