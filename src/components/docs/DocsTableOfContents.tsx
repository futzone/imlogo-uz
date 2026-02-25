'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export default function DocsTableOfContents({ content }: { content: string }) {
    const [activeId, setActiveId] = useState<string>('');
    const [headings, setHeadings] = useState<TocItem[]>([]);

    // Parse headings from markdown content
    useEffect(() => {
        const lines = content.split('\n');
        const items: TocItem[] = [];
        let inCodeBlock = false;

        for (const line of lines) {
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                continue;
            }
            if (inCodeBlock) continue;

            const match = line.match(/^(#{2,3})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                const id = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-');
                items.push({ id, text, level });
            }
        }
        setHeadings(items);
    }, [content]);

    // IntersectionObserver for active heading
    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                        break;
                    }
                }
            },
            { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
        );

        for (const heading of headings) {
            const el = document.getElementById(heading.id);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav className="w-full">
            <h4 className="text-xs font-semibold text-foreground-accent uppercase tracking-wider mb-3">
                Mundarija
            </h4>
            <ul className="space-y-1 border-l border-gray-200">
                {headings.map((heading) => (
                    <li key={heading.id}>
                        <a
                            href={`#${heading.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={clsx(
                                'block text-sm py-1 border-l-2 -ml-px transition-colors',
                                heading.level === 2 ? 'pl-3' : 'pl-6',
                                activeId === heading.id
                                    ? 'border-primary text-primary font-medium'
                                    : 'border-transparent text-foreground-accent hover:text-foreground hover:border-gray-300'
                            )}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
