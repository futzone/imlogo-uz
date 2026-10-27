import AppShell from '@/components/app/shell/AppShell';

/** Ilovaning asosiy sahifalari: chap yon panelli dashboard. */
export default function AppMainLayout({ children }: { children: React.ReactNode }) {
    return <AppShell>{children}</AppShell>;
}
