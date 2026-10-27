import { Alphabet } from '@/lib/translit/core';

/** `sentences` — tasodifiy tanlangan tayyor gaplar ketma-ketligi. */
export type TypingMode = 'time' | 'words' | 'sentences';

export interface TypingConfig {
    mode: TypingMode;
    /** `time` rejimida — soniyalar, `words` rejimida — so'zlar, `sentences` rejimida — gaplar soni. */
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
export const sentenceOptions = [3, 5, 10, 20];

const modeOptions: Record<TypingMode, number[]> = { time: timeOptions, words: wordOptions, sentences: sentenceOptions };
const defaultAmounts: Record<TypingMode, number> = { time: 30, words: 25, sentences: 5 };

export const typingOptions = (config: TypingConfig): number[] =>
    modeOptions[config.mode];

/** Rejim almashganda miqdor yangi rejimning standart qiymatiga o'tadi. */
export const withTypingMode = (config: TypingConfig, mode: TypingMode): TypingConfig =>
    mode === config.mode ? config : { ...config, mode, amount: defaultAmounts[mode] };

/**
 * Gaplarda tinish belgilari va raqamlar o'zi bor, shuning uchun bu rejimda
 * qo'shimchalar hisobga olinmaydi (sozlamada esa boshqa rejimlar uchun saqlanadi).
 */
export const hasTypingExtras = (config: TypingConfig): boolean => config.mode !== 'sentences';

/** Mashqda haqiqatda ishlatiladigan sozlama. */
export const effectiveTypingConfig = (config: TypingConfig): TypingConfig =>
    hasTypingExtras(config) ? config : { ...config, punctuation: false, numbers: false };

export const typingConfigLabel = (config: TypingConfig): string =>
    `${config.amount} ${{ time: 'soniya', words: 'söz', sentences: 'gap' }[config.mode]}`;

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
        mode: json.mode === 'words' || json.mode === 'sentences' ? json.mode : 'time',
        amount: typeof json.amount === 'number' ? json.amount : 30,
        punctuation: json.punctuation === true,
        numbers: json.numbers === true,
        alphabet: json.alphabet === 'yangi' || json.alphabet === 'kirill' ? json.alphabet : 'lotin',
    };
};
