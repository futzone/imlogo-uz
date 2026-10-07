/**
 * O'zbek lotin yozuvida o‘, g‘ va tutuq belgisi turli klaviaturalarda
 * turlicha teriladi: ' ’ ‘ ʻ ʼ ` ´. Tez yozish mashqida ularning barchasi
 * bitta belgi sifatida qabul qilinadi ("yumshoq" tekshiruv).
 */
const APOSTROPHES = new Set(["'", '‘', '’', 'ʻ', 'ʼ', '`', '´', '′', 'ʹ']);

export const normalizeTypingChar = (char: string): string => (APOSTROPHES.has(char) ? "'" : char);

export const normalizeTypingText = (text: string): string => text.split('').map(normalizeTypingChar).join('');

export const isSameTypingChar = (a: string, b: string): boolean =>
    normalizeTypingChar(a) === normalizeTypingChar(b);

/** So'z to'liq va xatosiz terilganmi. */
export const isTypedWordCorrect = (input: string, target: string): boolean => {
    if (input.length !== target.length) return false;
    for (let i = 0; i < target.length; i++) {
        if (!isSameTypingChar(input[i], target[i])) return false;
    }
    return true;
};

/**
 * Ekranda ko'rsatish uchun: o/g dan keyin ‘ (o‘, g‘), qolgan hollarda ’
 * (tutuq belgisi). So'z uzunligi o'zgarmaydi.
 */
export const prettifyTypingWord = (word: string): string => {
    let result = '';
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (char === "'" && i > 0) {
            const prev = word[i - 1].toLowerCase();
            result += prev === 'o' || prev === 'g' ? '‘' : '’';
        } else {
            result += char;
        }
    }
    return result;
};
