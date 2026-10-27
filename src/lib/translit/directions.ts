import { Alphabet } from './core';

export const alphabetNames: Record<Alphabet, string> = {
    lotin: 'Lotin',
    yangi: 'Yangi lotin',
    kirill: 'Kirill',
};

/** Sahifa sarlavhalari uchun: "...dan" shakli. */
const fromNames: Record<Alphabet, string> = {
    lotin: 'Lotinçadan',
    yangi: 'Yangi alifbodan',
    kirill: 'Kirillçadan',
};
const toNames: Record<Alphabet, string> = {
    lotin: 'lotinçaga',
    yangi: 'yangi alifboga',
    kirill: 'kirillçaga',
};

export interface Direction {
    slug: string;
    from: Alphabet;
    to: Alphabet;
    /** Yon paneldagi qisqa nom. */
    label: string;
    /** Sahifa sarlavhasi. */
    title: string;
}

const direction = (from: Alphabet, to: Alphabet): Direction => ({
    slug: `${from}-${to}`,
    from,
    to,
    label: `${alphabetNames[from]} → ${alphabetNames[to]}`,
    title: `${fromNames[from]} ${toNames[to]} ögiriş`,
});

/** Yon panelda ko'rsatiladigan tartibda. */
export const directions: Direction[] = [
    direction('yangi', 'lotin'),
    direction('yangi', 'kirill'),
    direction('lotin', 'yangi'),
    direction('kirill', 'yangi'),
    direction('kirill', 'lotin'),
    direction('lotin', 'kirill'),
];

export const defaultDirection = directions[2];

export const findDirection = (from: Alphabet, to: Alphabet): Direction | undefined =>
    directions.find(d => d.from === from && d.to === to);

export const directionBySlug = (slug: string): Direction | undefined => directions.find(d => d.slug === slug);
