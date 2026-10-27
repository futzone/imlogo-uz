import Link from 'next/link';
import clsx from 'clsx';
import { LuHeadphones, LuKeyboard } from 'react-icons/lu';

/** Ilova bo'limlari: 0 — diktant, 1 — tez yozish. */
export const appSections = [
    { label: 'Diktant', href: '/app', icon: <LuHeadphones size={18} aria-hidden /> },
    { label: 'Tez yoziş', href: '/app/tez-yozish', icon: <LuKeyboard size={18} aria-hidden /> },
];

interface Props {
    index: number;
    /** Berilsa, yorliqlar sahifa ichidagi almashtirgich bo'ladi; aks holda — bo'limlarga havola. */
    onChange?: (index: number) => void;
    /** Yorliqlar butun kenglikni teng bo'lib egallaydi. */
    expand?: boolean;
}

/** Bo'limlar orasida almashtirgich: keng ekranda sarlavhada, telefonda — ekran pastida. */
const SectionTabs: React.FC<Props> = ({ index, onChange, expand }) => (
    <div className={clsx('flex', expand && 'w-full')}>
        {appSections.map((section, i) => {
            const selected = i === index;
            const classes = clsx(
                'inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 font-mono text-xs font-medium uppercase tracking-[1.2px] transition-all duration-[250ms]',
                expand && 'flex-1',
                selected ? 'bg-brand-gradient text-white shadow-glow' : 'text-muted hover:text-primary'
            );
            const content = (
                <>
                    {section.icon}
                    {section.label}
                </>
            );
            return onChange ? (
                <button key={section.href} type="button" aria-pressed={selected} onClick={() => onChange(i)} className={classes}>
                    {content}
                </button>
            ) : (
                <Link key={section.href} href={section.href} aria-current={selected ? 'page' : undefined} className={classes}>
                    {content}
                </Link>
            );
        })}
    </div>
);

export default SectionTabs;
