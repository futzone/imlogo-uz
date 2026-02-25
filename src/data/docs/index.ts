import { foydalanishContent } from './foydalanish';
import { qandayIshlaydiContent } from './qanday-ishlaydi';
import { texnikContent } from './texnik';

export interface DocSection {
    slug: string;
    title: string;
    content: string;
}

export const docSections: DocSection[] = [
    {
        slug: 'foydalanish',
        title: "Foydalanish qo'llanmasi",
        content: foydalanishContent,
    },
    {
        slug: 'qanday-ishlaydi',
        title: 'Qanday ishlaydi?',
        content: qandayIshlaydiContent,
    },
    {
        slug: 'texnik',
        title: "Texnik qo'llanma",
        content: texnikContent,
    },
];

export function getDocSection(slug: string): DocSection | undefined {
    return docSections.find((s) => s.slug === slug);
}
