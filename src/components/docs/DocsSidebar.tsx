'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { docSections } from '@/data/docs';
import clsx from 'clsx';

export default function DocsSidebar() {
    const pathname = usePathname();

    return (
        <nav className="w-full">
            <h3 className="text-sm font-semibold text-foreground-accent uppercase tracking-wider mb-4">
                Bo&apos;limlar
            </h3>
            <ul className="space-y-1">
                {docSections.map((section) => {
                    const href = `/qollanma/${section.slug}`;
                    const isActive = pathname === href;
                    return (
                        <li key={section.slug}>
                            <Link
                                href={href}
                                className={clsx(
                                    'block px-3 py-2 rounded-lg text-sm transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-foreground-accent hover:bg-gray-100 hover:text-foreground'
                                )}
                            >
                                {section.title}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
