'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LuHistory, LuInfo, LuSmartphone } from 'react-icons/lu';

import Logo from '@/components/Logo';
import AboutAppsSheet from './AboutAppsSheet';
import AppInfoSheet from './AppInfoSheet';
import SectionTabs, { appSections } from './SectionTabs';
import { IconButton } from './ui';

/** Bosh sahifaning shisha sarlavha paneli (logotip, bo'limlar, amallar) va telefondagi pastki navigatsiya. */
const AppHeader: React.FC = () => {
    const pathname = usePathname();
    const index = Math.max(0, appSections.findIndex(section => section.href === pathname));
    const [sheet, setSheet] = useState<'apps' | 'info' | null>(null);

    return (
        <>
            <header className="sticky top-0 z-40 mx-auto w-full max-w-[1100px] px-4 pt-3 sm:px-6">
                <div className="glass flex items-center gap-2 rounded-full py-1.5 pl-5 pr-2 shadow-glow-soft">
                    <Link href="/app" className="flex shrink-0 items-center" aria-label="Imlo Go — ilova bosh sahifasi">
                        <Logo className="h-6 sm:h-7" />
                    </Link>
                    <nav className="ml-3 hidden md:block" aria-label="Bo‘limlar">
                        <SectionTabs index={index} />
                    </nav>
                    <div className="ml-auto flex items-center">
                        <IconButton
                            icon={<LuSmartphone size={20} aria-hidden />}
                            tooltip="Ilovalarimiz"
                            label="Ilovalarimiz"
                            onClick={() => setSheet('apps')}
                        />
                        <IconButton
                            icon={<LuInfo size={20} aria-hidden />}
                            tooltip="Dastur haqida"
                            label="Dastur haqida"
                            onClick={() => setSheet('info')}
                        />
                        <IconButton
                            icon={<LuHistory size={20} aria-hidden />}
                            tooltip="Natijalarim"
                            label="Natijalarim"
                            href={`/app/natijalar?tab=${index}`}
                        />
                    </div>
                </div>
            </header>

            <nav
                className="app-bottom-tabs fixed inset-x-0 bottom-0 z-40 px-4 pb-3 pt-1 md:hidden"
                aria-label="Bo‘limlar"
            >
                <div className="glass mx-auto max-w-[480px] rounded-full p-1.5 shadow-glow-soft">
                    <SectionTabs index={index} expand />
                </div>
            </nav>

            <AboutAppsSheet open={sheet === 'apps'} onClose={() => setSheet(null)} />
            <AppInfoSheet open={sheet === 'info'} onClose={() => setSheet(null)} />
        </>
    );
};

export default AppHeader;
