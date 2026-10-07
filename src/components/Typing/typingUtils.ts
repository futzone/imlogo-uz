/**
 * O'zbek lotin yozuvida o‘, g‘ va tutuq belgisi turli klaviaturalarda turlicha
 * teriladi (' ’ ‘ ʻ ʼ ` ´). Tez yozish mashqida ularning barchasi bitta belgi
 * sifatida qabul qilinadi.
 */
const APOSTROPHES = new Set(["'", '‘', '’', 'ʻ', 'ʼ', '`', '´', '′', 'ʹ']);

export const normalizeChar = (char: string): string =>
    APOSTROPHES.has(char) ? "'" : char.toLowerCase();

export const isSameChar = (a: string, b: string): boolean =>
    normalizeChar(a) === normalizeChar(b);

/** So'z to'liq va xatosiz terilganmi */
export const isWordCorrect = (input: string, target: string): boolean =>
    input.length === target.length && input.split('').every((char, i) => isSameChar(char, target[i]));

/** Ekranda ko'rsatish uchun: o‘/g‘ dan keyin ‘, qolgan hollarda ’ (tutuq belgisi) */
export const prettifyWord = (word: string): string =>
    word.replace(/(.)'/g, (_, prev: string) =>
        prev.toLowerCase() === 'o' || prev.toLowerCase() === 'g' ? `${prev}‘` : `${prev}’`
    );

export const pickWords = (source: string[], count: number): string[] => {
    const result: string[] = [];
    while (result.length < count) {
        const word = source[Math.floor(Math.random() * source.length)];
        if (word !== result[result.length - 1]) result.push(word);
    }
    return result;
};
