import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Heading } from '@/lib/slug';

const linkClass = 'font-medium text-primary no-underline hover:underline';

const childrenText = (children: React.ReactNode): string => {
    if (typeof children === 'string' || typeof children === 'number') return String(children);
    if (Array.isArray(children)) return children.map(childrenText).join('');
    if (children && typeof children === 'object' && 'props' in children) {
        return childrenText((children as React.ReactElement<{ children?: React.ReactNode }>).props.children);
    }
    return '';
};

/**
 * Qo'llanma matni (Markdown) — serverda chiziladi, brauzerga qo'shimcha JS
 * yuborilmaydi. Sarlavha id'lari mundarija bilan bir xil tartibda `headings`
 * ro'yxatidan olinadi, shuning uchun havolalar doim mos keladi.
 */
const DocsContent: React.FC<{ content: string; headings: Heading[] }> = ({ content, headings }) => {
    let index = 0;
    const nextId = () => headings[index++]?.id;

    return (
        <div className="prose max-w-none text-[16px] leading-[1.75] text-foreground prose-headings:scroll-mt-28 prose-headings:font-heading prose-headings:text-foreground prose-h2:mt-12 prose-h2:border-b prose-h2:border-line prose-h2:pb-2 prose-h2:text-2xl prose-h3:mt-8 prose-h3:text-lg prose-p:text-foreground/85 prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-li:text-foreground/85 prose-li:marker:text-primary/60">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h2: ({ children }) => <h2 id={nextId()}>{children}</h2>,
                    h3: ({ children }) => <h3 id={nextId()}>{children}</h3>,
                    // Jadval kabi `not-prose` bloklar ichida ham havola ekani ko'rinib tursin.
                    a: ({ href = '', children }) =>
                        href.startsWith('/') || href.startsWith('#') ? (
                            <Link href={href} className={linkClass}>
                                {children}
                            </Link>
                        ) : (
                            <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                {children}
                            </a>
                        ),
                    table: ({ children }) => (
                        <div className="not-prose my-6 overflow-x-auto rounded-xl border border-line">
                            <table className="w-full border-collapse text-left text-[15px]">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-surface">{children}</thead>,
                    th: ({ children, style }) => (
                        <th style={style} className="border-b border-line px-4 py-3 font-heading text-sm font-semibold">
                            {children}
                        </th>
                    ),
                    td: ({ children, style }) => (
                        <td style={style} className="border-b border-line/60 px-4 py-3 align-top text-foreground/85">
                            {children}
                        </td>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="not-prose my-6 rounded-r-xl border-l-4 border-primary/50 bg-primary/5 px-5 py-3 text-[15px] leading-relaxed [&_p]:my-1">
                            {children}
                        </blockquote>
                    ),
                    pre: ({ children }) => (
                        <pre className="not-prose my-6 overflow-x-auto rounded-xl bg-[#14101f] p-4 font-mono text-[13px] leading-relaxed text-white/90">
                            {children}
                        </pre>
                    ),
                    code: ({ className, children }) =>
                        className || childrenText(children).includes('\n') ? (
                            <code className={className}>{children}</code>
                        ) : (
                            <code className="rounded-md border border-primary/15 bg-primary/5 px-1.5 py-0.5 font-mono text-[0.88em] font-normal text-primary-accent before:content-none after:content-none">
                                {children}
                            </code>
                        ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default DocsContent;
