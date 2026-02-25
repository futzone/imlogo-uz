'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function getChildrenText(children: React.ReactNode): string {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(getChildrenText).join('');
    if (children && typeof children === 'object' && 'props' in children) {
        return getChildrenText((children as React.ReactElement<{ children?: React.ReactNode }>).props.children);
    }
    return String(children ?? '');
}

export default function DocsContent({ content }: { content: string }) {
    return (
        <article className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-h1:text-3xl md:prose-h1:text-4xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mt-10 prose-h3:text-xl prose-p:text-foreground-accent prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-foreground-accent prose-strong:text-foreground prose-img:rounded-lg prose-img:shadow-md">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h2({ children }) {
                        const id = slugify(getChildrenText(children));
                        return <h2 id={id}>{children}</h2>;
                    },
                    h3({ children }) {
                        const id = slugify(getChildrenText(children));
                        return <h3 id={id}>{children}</h3>;
                    },
                    table({ children }) {
                        return (
                            <div className="overflow-x-auto my-6">
                                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                                    {children}
                                </table>
                            </div>
                        );
                    },
                    thead({ children }) {
                        return <thead className="bg-gray-50">{children}</thead>;
                    },
                    th({ children }) {
                        return (
                            <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-gray-200">
                                {children}
                            </th>
                        );
                    },
                    td({ children }) {
                        return (
                            <td className="px-4 py-3 text-foreground-accent border-b border-gray-100">
                                {children}
                            </td>
                        );
                    },
                    tr({ children }) {
                        return <tr className="hover:bg-gray-50 transition-colors">{children}</tr>;
                    },
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const lang = match ? match[1] : undefined;
                        const codeString = String(children).replace(/\n$/, '');
                        const isBlock = codeString.includes('\n');

                        if (lang || isBlock) {
                            return (
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={lang || 'text'}
                                    PreTag="div"
                                    customStyle={{
                                        borderRadius: '0.75rem',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.6',
                                        margin: 0,
                                    }}
                                >
                                    {codeString}
                                </SyntaxHighlighter>
                            );
                        }

                        // Inline code
                        return (
                            <code
                                className="bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded text-sm font-mono border border-purple-100"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    pre({ children }) {
                        return <>{children}</>;
                    },
                    blockquote({ children }) {
                        return (
                            <blockquote className="border-l-4 border-primary/40 bg-purple-50/50 pl-4 py-2 my-4 rounded-r-lg not-italic">
                                {children}
                            </blockquote>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}
