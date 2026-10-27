import { Alphabet } from '@/lib/translit/core';

export type TypingMode = 'time' | 'words';

export interface TypingConfig {
    mode: TypingMode;
    /** `time` rejimida — soniyalar, `words` rejimida — so'zlar soni. */
    amount: number;
    punctuation: boolean;
    numbers: boolean;
    /** So'zlar qaysi yozuvda: amaldagi lotin, yangi lotin yoki kirill. */
    alphabet: Alphabet;
}

export const defaultTypingConfig: TypingConfig = {
    mode: 'time',
    amount: 30,
    punctuation: false,
    numbers: false,
    alphabet: 'lotin',
};

export const typingAlphabets: { value: Alphabet; label: string }[] = [
    { value: 'lotin', label: 'eski' },
    { value: 'yangi', label: 'yangi' },
    { value: 'kirill', label: 'kirill' },
];

export const timeOptions = [15, 30, 60, 120];
export const wordOptions = [10, 25, 50, 100];

export const typingOptions = (config: TypingConfig): number[] =>
    config.mode === 'time' ? timeOptions : wordOptions;

/** Rejim almashganda miqdor yangi rejimning standart qiymatiga o'tadi. */
export const withTypingMode = (config: TypingConfig, mode: TypingMode): TypingConfig =>
    mode === config.mode ? config : { ...config, mode, amount: mode === 'time' ? 30 : 25 };

export const typingConfigLabel = (config: TypingConfig): string =>
    config.mode === 'time' ? `${config.amount} soniya` : `${config.amount} söz`;

const alphabetLabels: Record<Alphabet, string> = { lotin: 'eski lotin', yangi: 'yangi lotin', kirill: 'kirill' };

export const typingAlphabetLabel = (config: TypingConfig): string => alphabetLabels[config.alphabet];

export const isSameTypingConfig = (a: TypingConfig, b: TypingConfig): boolean =>
    a.mode === b.mode &&
    a.amount === b.amount &&
    a.punctuation === b.punctuation &&
    a.numbers === b.numbers &&
    a.alphabet === b.alphabet;

/** Saqlangan (ishonchsiz) qiymatdan sozlamani tiklaydi. */
export const parseTypingConfig = (raw: unknown): TypingConfig => {
    const json = (raw ?? {}) as Partial<TypingConfig>;
    return {
        mode: json.mode === 'words' ? 'words' : 'time',
        amount: typeof json.amount === 'number' ? json.amount : 30,
        punctuation: json.punctuation === true,
        numbers: json.numbers === true,
        alphabet: json.alphabet === 'yangi' || json.alphabet === 'kirill' ? json.alphabet : 'lotin',
    };
};
