'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { LuArrowRight, LuX } from 'react-icons/lu';

import { celebration } from '@/data/celebration';
import { FlagDot } from './CelebrationBadge';
import { useCelebration } from './useCelebration';

interface Props {
    className?: string;
    /** Harakatga chaqiruvchi tugma (ilova ichida kerak emas) */
    showCta?: boolean;
}

/** O‘zbek tili bayrami tabrik banneri. Yopilsa, shu yil qayta ko‘rinmaydi. */
const CelebrationBanner: React.FC<Props> = ({ className, showCta = true }) => {
    const { active, dismissed, years, dismiss } = useCelebration();
    if (!active || dismissed) return null;

    return (
        <aside
            role="note"
            aria-label={celebration.title(years)}
            className={clsx('glass relative overflow-hidden rounded-2xl text-left shadow-glow-soft', className)}
        >
            {/* Bayroq chizig‘i: ko‘k · qizil · oq · qizil · yashil */}
            <div aria-hidden className="flex h-1.5 w-full flex-col">
                <span className="flex-[10] bg-[#0099B5]" />
                <span className="flex-[1] bg-[#CE1126]" />
                <span className="flex-[10] bg-white" />
                <span className="flex-[1] bg-[#CE1126]" />
                <span className="flex-[10] bg-[#1EB53A]" />
            </div>

            <div className="flex flex-col gap-4 p-4 pr-12 sm:flex-row sm:items-center sm:p-5 sm:pr-14">
                <div
                    aria-hidden
                    className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[#0099B5]/25 bg-gradient-to-br from-[#0099B5]/10 to-[#1EB53A]/10 text-[#0b6e80]"
                >
                    <span className="font-heading text-xl font-bold leading-none">{years}</span>
                    <span className="mt-1 font-mono text-[9px] uppercase tracking-widest">yil</span>
                </div>
                <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-heading text-base font-bold text-foreground sm:text-lg">
                        <FlagDot />
                        {celebration.title(years)}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{celebration.text(years)}</p>
                </div>
                {showCta && (
                    <Link
                        href={celebration.cta.href}
                        className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r from-[#0099B5] to-[#1EB53A] px-5 font-body text-xs font-semibold uppercase tracking-wider text-white transition-transform duration-300 hover:scale-105 sm:self-center"
                    >
                        {celebration.cta.text}
                        <LuArrowRight size={16} aria-hidden />
                    </Link>
                )}
            </div>

            <button
                type="button"
                onClick={dismiss}
                className="absolute right-2 top-3.5 flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label="Tabrikni yopiş"
            >
                <LuX size={18} aria-hidden />
            </button>
        </aside>
    );
};

export default CelebrationBanner;
