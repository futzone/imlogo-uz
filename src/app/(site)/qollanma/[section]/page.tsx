import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LuArrowLeft, LuArrowRight, LuClock, LuMessageSquare } from 'react-icons/lu';

import JsonLd from '@/components/JsonLd';
import DocsContent from '@/components/docs/DocsContent';
import DocsTableOfContents from '@/components/docs/DocsTableOfContents';
import { faqs } from '@/data/faq';
import { footerDetails } from '@/data/footer';
import { docSections, getDocSection } from '@/data/docs';
import { breadcrumbLd, CONTENT_UPDATED, pageMetadata } from '@/lib/seo';
import { extractHeadings } from '@/lib/slug';

interface Props {
    params: { section: string };
}

export const dynamicParams = false;

export const generateStaticParams = () => docSections.map(section => ({ section: section.slug }));

export const generateMetadata = ({ params }: Props) => {
    const section = getDocSection(params.section);
    if (!section) return {};
    return pageMetadata({
        title: `${section.title} — qöllanma`,
        description: section.description,
        path: `/qollanma/${section.slug}`,
    });
};

/** O'qish vaqti: daqiqasiga ~180 so'z. */
const readingMinutes = (markdown: string) => Math.max(1, Math.round(markdown.split(/\s+/).length / 180));

export default function DocSectionPage({ params }: Props) {
    const section = getDocSection(params.section);
    if (!section) notFound();

    const index = docSections.indexOf(section);
    const previous = docSections[index - 1];
    const next = docSections[index + 1];
    const headings = extractHeadings(section.content);
    const url = `https://imlogo.uz/qollanma/${section.slug}`;

    return (
        <div className="flex gap-12">
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        section.slug === 'savollar'
                            ? {
                                  '@type': 'FAQPage',
                                  mainEntity: faqs.map(faq => ({
                                      '@type': 'Question',
                                      name: faq.question,
                                      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
                                  })),
                              }
                            : {
                                  '@type': 'TechArticle',
                                  headline: section.title,
                                  description: section.description,
                                  inLanguage: 'uz',
                                  url,
                                  mainEntityOfPage: url,
                                  image: 'https://imlogo.uz/opengraph-image',
                                  dateModified: CONTENT_UPDATED,
                                  author: { '@id': 'https://imlogo.uz/#organization' },
                                  publisher: { '@id': 'https://imlogo.uz/#organization' },
                              },
                        breadcrumbLd([
                            { name: 'Qöllanma', path: '/qollanma' },
                            { name: section.title, path: `/qollanma/${section.slug}` },
                        ]),
                    ],
                }}
            />

            <article className="min-w-0 max-w-3xl flex-1">
                <nav aria-label="Yöl" className="font-mono text-xs text-muted">
                    <Link href="/" className="hover:text-primary">Boş sahifa</Link>
                    <span className="mx-2">/</span>
                    <Link href="/qollanma" className="hover:text-primary">Qöllanma</Link>
                    <span className="mx-2">/</span>
                    <span className="text-foreground">{section.title}</span>
                </nav>

                <header className="mt-5 border-b border-line pb-6">
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-primary">{section.group}</p>
                    <h1 className="mt-2 text-3xl font-bold md:text-[42px] md:leading-tight">{section.title}</h1>
                    <p className="mt-3 text-lg leading-relaxed text-muted">{section.description}</p>
                    <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-muted">
                        <LuClock size={14} aria-hidden />
                        {readingMinutes(section.content)} daqiqa öqiş
                    </p>
                </header>

                <div className="mt-6">
                    <DocsContent content={section.content} headings={headings} />
                </div>

                <div className="mt-12 flex items-start gap-3 rounded-2xl border border-line bg-surface p-5 text-[15px]">
                    <LuMessageSquare size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                    <p className="text-muted">
                        Bu sahifada xato yoki tuşunarsiz joy bormi?{' '}
                        <a href={footerDetails.telegramBot} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                            Bizga yozing
                        </a>{' '}
                        — tezda tuzatamiz.
                    </p>
                </div>

                <nav aria-label="Boşqa bölimlar" className="mt-6 grid gap-3 sm:grid-cols-2">
                    {previous ? (
                        <Link href={`/qollanma/${previous.slug}`} className="group rounded-2xl border border-line bg-white p-4 transition-colors hover:border-primary/50">
                            <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                                <LuArrowLeft size={14} aria-hidden /> Oldingi
                            </span>
                            <span className="mt-1 block font-semibold group-hover:text-primary">{previous.title}</span>
                        </Link>
                    ) : (
                        <span />
                    )}
                    {next && (
                        <Link href={`/qollanma/${next.slug}`} className="group rounded-2xl border border-line bg-white p-4 text-right transition-colors hover:border-primary/50">
                            <span className="flex items-center justify-end gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                                Keyingi <LuArrowRight size={14} aria-hidden />
                            </span>
                            <span className="mt-1 block font-semibold group-hover:text-primary">{next.title}</span>
                        </Link>
                    )}
                </nav>
            </article>

            <aside className="hidden w-56 shrink-0 xl:block">
                <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto">
                    <DocsTableOfContents headings={headings} />
                </div>
            </aside>
        </div>
    );
}
