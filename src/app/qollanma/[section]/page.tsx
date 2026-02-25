import { notFound } from 'next/navigation';
import { docSections, getDocSection } from '@/data/docs';
import DocsContent from '@/components/docs/DocsContent';
import DocsTableOfContents from '@/components/docs/DocsTableOfContents';

export function generateStaticParams() {
    return docSections.map((section) => ({
        section: section.slug,
    }));
}

export function generateMetadata({ params }: { params: { section: string } }) {
    const section = getDocSection(params.section);
    if (!section) return {};
    return {
        title: `${section.title} — Imlo Go`,
        description: `Imlo Go: ${section.title}`,
    };
}

export default function DocSectionPage({ params }: { params: { section: string } }) {
    const section = getDocSection(params.section);
    if (!section) notFound();

    return (
        <>
            {/* Content */}
            <main className="min-w-0 flex-1">
                <DocsContent content={section.content} />
            </main>

            {/* Table of Contents - desktop */}
            <aside className="hidden xl:block w-52 shrink-0">
                <div className="sticky top-32">
                    <DocsTableOfContents content={section.content} />
                </div>
            </aside>
        </>
    );
}
