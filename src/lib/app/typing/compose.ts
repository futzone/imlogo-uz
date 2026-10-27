import { normalizeTypingChar } from './text';

/** Yangi alifbo harfi → oddiy klaviaturadagi ikki belgilik yozilishi. */
const DIGRAPHS: Record<string, [string, string]> = {
    ş: ['s', 'h'],
    ç: ['c', 'h'],
    ö: ['o', "'"],
    ğ: ['g', "'"],
};

const withCaseOf = (source: string, letter: string) =>
    source !== source.toLowerCase() ? letter.toUpperCase() : letter;

export interface Composition {
    value: string;
    /** Birinchi belgisi terilib, ikkinchisi kutilayotgan harf o'rni. */
    pending: number | null;
}

/**
 * Yangi alifbo mashqi: Ş, Ç, Ö, Ğ harflari oddiy klaviaturada yo'q, shuning
 * uchun ular "sh", "ch", "o'", "g'" deb ham terilishi mumkin. Kutilgan harf
 * shulardan biri bo'lsa, birinchi belgi darhol shu harf sifatida ko'rsatiladi,
 * ikkinchisi esa "yutiladi". Ikkinchi belgi boshqa bo'lsa, harf oddiy s/c/o/g
 * ga qaytadi (xato). Ş va boshqalarni to'g'ridan-to'g'ri terish ham ishlaydi.
 *
 * `previous` — dvigateldagi joriy qiymat, `typed` — maydondagi yangi qiymat,
 * `finalize` — so'z bo'sh joy bilan yakunlanmoqda.
 */
export const composeYangi = (
    previous: string,
    typed: string,
    target: string,
    pending: number | null,
    finalize = false
): Composition => {
    // O'chirish yoki tahrir — hech narsa o'zgartirilmaydi.
    if (!typed.startsWith(previous)) return { value: typed, pending: null };

    let value = previous;
    let waiting = pending;
    const revert = () => {
        if (waiting === null) return;
        const special = value[waiting].toLowerCase();
        value = value.slice(0, waiting) + withCaseOf(value[waiting], DIGRAPHS[special][0]) + value.slice(waiting + 1);
        waiting = null;
    };

    for (const char of typed.slice(previous.length)) {
        if (waiting !== null && waiting === value.length - 1) {
            const second = DIGRAPHS[value[waiting].toLowerCase()][1];
            if (normalizeTypingChar(char.toLowerCase()) === second) {
                waiting = null;
                continue;
            }
            revert();
        }
        const expected = target[value.length]?.toLowerCase();
        const digraph = expected ? DIGRAPHS[expected] : undefined;
        if (digraph && char.toLowerCase() === digraph[0]) {
            value += withCaseOf(char, expected);
            waiting = value.length - 1;
        } else {
            value += char;
        }
    }

    if (finalize) revert();
    return { value, pending: waiting };
};
