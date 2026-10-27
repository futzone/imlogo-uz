'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { LuChevronDown } from 'react-icons/lu';

import { getDocSection } from '@/data/docs';
import DocsSidebar from './DocsSidebar';

/** Telefonda: joriy bo'lim nomi yozilgan ochiluvchi menyu (matnni yopmaydi). */
const DocsMobileNav: React.FC = () => {
    const pathname = usePathname();
    const ref = useRef<HTMLDetailsElement>(null);
    const current = getDocSection(pathname.split('/').pop() ?? '');

    // Boshqa bo'limga o'tilganda menyu yopiladi.
    useEffect(() => {
        if (ref.current) ref.current.open = false;
    }, [pathname]);

    return (
        <details ref={ref} className="group mb-8 rounded-2xl border border-line bg-white lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Qöllanma</span>
                    <span className="font-semibold">{current?.title ?? 'Bölimlar'}</span>
                </span>
                <LuChevronDown size={20} className="text-primary transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="border-t border-line px-1 py-4">
                <DocsSidebar />
            </div>
        </details>
    );
};

export default DocsMobileNav;
