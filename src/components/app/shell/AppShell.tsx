'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { LuMenu, LuX } from 'react-icons/lu';

import Logo from '@/components/Logo';
import CelebrationBanner from '@/components/celebration/CelebrationBanner';
import { useAuth } from '../auth/AuthProvider';
import AppSidebar from './AppSidebar';
import Avatar from './Avatar';

const SIDEBAR_WIDTH = 'lg:pl-[272px]';

/**
 * Ilova (dashboard) qolipi: keng ekranda chapda doimiy yon panel,
 * telefonda — yuqori panel va chapdan chiqadigan menyu.
 */
const AppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const { account, openSignIn } = useAuth();

    // Sahifa almashganda menyu yopiladi (masalan, brauzerning "orqaga" tugmasida).
    useEffect(() => setMenuOpen(false), [pathname]);

    return (
        <div className="flex min-h-dvh">
            <aside className="glass fixed inset-y-0 left-0 z-30 hidden w-[272px] !border-y-0 !border-l-0 lg:block">
                <AppSidebar />
            </aside>

            <Dialog open={menuOpen} onClose={setMenuOpen} className="relative z-50 text-base lg:hidden">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-primary-accent/25 transition-opacity duration-200 data-[closed]:opacity-0"
                />
                <DialogPanel
                    transition
                    className="fixed inset-y-0 left-0 w-[min(300px,86vw)] bg-white shadow-glow-card transition duration-300 ease-out data-[closed]:-translate-x-full"
                >
                    <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Menyuni yopiş"
                        className="absolute right-2 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-primary/10 hover:text-primary"
                    >
                        <LuX size={20} aria-hidden />
                    </button>
                    <AppSidebar onNavigate={() => setMenuOpen(false)} />
                </DialogPanel>
            </Dialog>

            <div className={`flex min-w-0 flex-1 flex-col ${SIDEBAR_WIDTH}`}>
                <header className="app-topbar sticky top-0 z-30 px-4 pt-3 lg:hidden">
                    <div className="glass flex items-center gap-2 rounded-full py-1.5 pl-2 pr-2 shadow-glow-soft">
                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Menyuni oçiş"
                            aria-expanded={menuOpen}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-primary/10 hover:text-primary"
                        >
                            <LuMenu size={22} aria-hidden />
                        </button>
                        <Link href="/app" className="flex items-center" aria-label="Imlo Go — ilova boş sahifasi">
                            <Logo className="h-[19px]" />
                        </Link>
                        <div className="ml-auto">
                            {account ? (
                                <button type="button" onClick={() => setMenuOpen(true)} aria-label="Hisob">
                                    <Avatar account={account} className="!h-9 !w-9 !text-sm" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={openSignIn}
                                    className="inline-flex h-10 items-center rounded-full px-4 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-primary hover:bg-primary/10"
                                >
                                    Kiriş
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
                    <CelebrationBanner className="mt-4" showCta={false} />
                </div>
                <main className="flex flex-1 flex-col">{children}</main>
            </div>
        </div>
    );
};

export default AppShell;
