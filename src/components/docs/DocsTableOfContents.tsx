'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { Heading } from '@/lib/slug';

/** "Shu sahifada": sarlavhalar ro'yxati, o'qilayotgan bo'lim belgilanadi. */
const DocsTableOfContents: React.FC<{ headings: Heading[] }> = ({ headings }) => {
    const [activeId, setActiveId] = useState(headings[0]?.id ?? '');

    useEffect(() => {
        const elements = headings
            .map(heading => document.getElementById(heading.id))
            .filter((el): el is HTMLElement => el !== null);
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            entries => {
                const visible = entries.filter(entry => entry.isIntersecting);
                if (visible.length > 0) setActiveId(visible[0].target.id);
            },
            { rootMargin: '-96px 0px -65% 0px' }
        );
        elements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav aria-label="Şu sahifada">
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Şu sahifada</p>
            <ul className="border-l border-line">
                {headings.map(heading => (
                    <li key={heading.id}>
                        <a
                            href={`#${heading.id}`}
                            className={clsx(
                                '-ml-px block border-l-2 py-1.5 text-sm leading-snug transition-colors',
                                heading.level === 2 ? 'pl-3' : 'pl-6',
                                activeId === heading.id
                                    ? 'border-primary font-medium text-primary'
                                    : 'border-transparent text-muted hover:border-primary/40 hover:text-foreground'
                            )}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default DocsTableOfContents;
