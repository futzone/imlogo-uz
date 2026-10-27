/**
 * Sarlavhadan sahifa ichidagi havola (id) yasaydi. O'zbekcha harflar va kirill
 * saqlanadi, tutuq belgilari olib tashlanadi: "Qanday o‘giriladi?" → "qanday-ogiriladi".
 */
export const slugify = (text: string): string =>
    text
        .toLowerCase()
        .replace(/['`‘’ʻʼ´]/g, '')
        // Lotin (ş, ç, ö, ğ bilan), kirill harflari, raqamlar va bo'shliqlar qoladi.
        .replace(/[^a-z0-9\u00C0-\u024F\u0400-\u04FF\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

export interface Heading {
    id: string;
    text: string;
    level: 2 | 3;
}

/** Markdown matnidagi ## va ### sarlavhalar (kod bloklari ichidagilardan tashqari). */
export const extractHeadings = (markdown: string): Heading[] => {
    const headings: Heading[] = [];
    const used = new Map<string, number>();
    let inCode = false;
    for (const line of markdown.split('\n')) {
        if (line.trim().startsWith('```')) inCode = !inCode;
        if (inCode) continue;
        const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
        if (!match) continue;
        const text = match[2].replace(/[*_`]/g, '').replace(/\[(.+?)\]\(.+?\)/g, '$1');
        headings.push({ id: uniqueId(slugify(text), used), text, level: match[1].length as 2 | 3 });
    }
    return headings;
};

/** Bir xil sarlavhalar uchun "-2", "-3" qo'shimchasi (GitHub kabi). */
export const uniqueId = (id: string, used: Map<string, number>): string => {
    const count = used.get(id) ?? 0;
    used.set(id, count + 1);
    return count === 0 ? id : `${id}-${count + 1}`;
};
