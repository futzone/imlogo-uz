'use client';

import clsx from 'clsx';

import { celebration } from '@/data/celebration';
import { useCelebration } from './useCelebration';

interface Props {
    className?: string;
    /** Qisqa matn — tor joylar (ilova sarlavhasi) uchun */
    compact?: boolean;
}

/** Bayram kuni ko‘rinadigan bayroq rangidagi kichik badge. */
const CelebrationBadge: React.FC<Props> = ({ className, compact }) => {
    const { active, years } = useCelebration();
    if (!active) return null;

    return (
        <span
            className={clsx(
                'inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#1EB53A]/30 bg-gradient-to-r from-[#0099B5]/10 via-white to-[#1EB53A]/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-[#0b6e80] sm:text-[11px]',
                className
            )}
            title={celebration.title(years)}
        >
            <FlagDot />
            {compact ? `Til bayrami · ${years} yil` : celebration.badge(years)}
        </span>
    );
};

/** O‘zbekiston bayrog‘i ranglaridagi kichik doira. */
export const FlagDot: React.FC<{ className?: string }> = ({ className }) => (
    <span
        aria-hidden
        className={clsx('h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10', className)}
        style={{
            background:
                'linear-gradient(to bottom, #0099B5 0 33%, #CE1126 33% 36%, #fff 36% 64%, #CE1126 64% 67%, #1EB53A 67% 100%)',
        }}
    />
);

export default CelebrationBadge;
