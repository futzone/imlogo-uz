import { TypingConfig } from './config';
import { normalizeTypingText } from './text';

/**
 * `public/words/uz.txt` formatidagi matnni so'zlar ro'yxatiga aylantiradi:
 * har bir qatorda bitta so'z, `#` bilan boshlangan qatorlar — izoh.
 */
export const parseWordList = (raw: string): string[] => {
    const words = new Set<string>();
    for (const line of raw.split('\n')) {
        const word = normalizeTypingText(line.trim().toLowerCase());
        if (word === '' || word.startsWith('#') || word.includes(' ')) continue;
        words.add(word);
    }
    return Array.from(words);
};

let wordsPromise: Promise<string[]> | null = null;

/** Mashq uchun so'zlar to'plami (bir marta yuklanadi). */
export const loadTypingWords = (): Promise<string[]> => {
    wordsPromise ??= fetch('/words/uz.txt')
        .then(response => {
            if (!response.ok) throw new Error(`So'zlar yuklanmadi (${response.status})`);
            return response.text();
        })
        .then(parseWordList)
        .catch(error => {
            wordsPromise = null;
            throw error;
        });
    return wordsPromise;
};

const randomInt = (max: number) => Math.floor(Math.random() * max);

const SENTENCE_ENDINGS = ['.', '.', '.', '?', '!'];

/** So'zlar to'plamidan mashq uchun tasodifiy so'zlar ketma-ketligini beradi. */
export const createWordGenerator = (pool: string[], config: TypingConfig): (() => string) => {
    let last: string | null = null;
    let sentenceStart = true;

    const punctuate = (word: string): string => {
        if (!config.punctuation) return word;

        if (sentenceStart) {
            word = word[0].toUpperCase() + word.slice(1);
            sentenceStart = false;
        }

        const roll = randomInt(100);
        if (roll < 12) {
            sentenceStart = true;
            return word + SENTENCE_ENDINGS[randomInt(SENTENCE_ENDINGS.length)];
        }
        if (roll < 26) return `${word},`;
        if (roll < 29) return `${word};`;
        if (roll < 32) return `${word}:`;
        return word;
    };

    return () => {
        if (config.numbers && randomInt(10) === 0) {
            last = null;
            return punctuate(randomInt(1000).toString());
        }

        let word = pool[randomInt(pool.length)];
        // Bir xil so'z ketma-ket ikki marta chiqmasin.
        for (let i = 0; i < 5 && word === last && pool.length > 1; i++) {
            word = pool[randomInt(pool.length)];
        }
        last = word;
        return punctuate(word);
    };
};
