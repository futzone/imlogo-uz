'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

import { docGroups, docSections } from '@/data/docs';

/** Qo'llanma bo'limlari, guruhlar bo'yicha. */
const DocsSidebar: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
    const pathname = usePathname();

    return (
        <nav aria-label="Qöllanma bölimlari" className="flex flex-col gap-6">
            {docGroups.map(group => (
                <div key={group}>
                    <p className="mb-2 px-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{group}</p>
                    <ul className="flex flex-col gap-0.5">
                        {docSections
                            .filter(section => section.group === group)
                            .map(section => {
                                const href = `/qollanma/${section.slug}`;
                                const active = pathname === href;
                                return (
                                    <li key={section.slug}>
                                        <Link
                                            href={href}
                                            onClick={onNavigate}
                                            aria-current={active ? 'page' : undefined}
                                            className={clsx(
                                                'block rounded-lg px-3 py-2 text-[15px] transition-colors',
                                                active
                                                    ? 'bg-primary/10 font-semibold text-primary'
                                                    : 'text-foreground/80 hover:bg-primary/5 hover:text-primary'
                                            )}
                                        >
                                            {section.title}
                                        </Link>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            ))}
        </nav>
    );
};

export default DocsSidebar;
