import { Alphabet, transliterate } from '@/lib/translit/core';
import { loadLexicon } from '@/lib/translit/lexicon';
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

const loadLatinWords = (): Promise<string[]> => {
    wordsPromise ??= fetch('/words/uz.txt')
        .then(response => {
            if (!response.ok) throw new Error(`Sözlar yuklanmadi (${response.status})`);
            return response.text();
        })
        .then(parseWordList)
        .catch(error => {
            wordsPromise = null;
            throw error;
        });
    return wordsPromise;
};

const converted = new Map<Alphabet, Promise<string[]>>();

/**
 * Mashq uchun so'zlar to'plami (har bir yozuv uchun bir marta tayyorlanadi).
 * To'plam lotincha saqlanadi, yangi alifbo va kirillga lug'at yordamida o'giriladi.
 */
export const loadTypingWords = (alphabet: Alphabet = 'lotin'): Promise<string[]> => {
    if (alphabet === 'lotin') return loadLatinWords();
    let promise = converted.get(alphabet);
    if (!promise) {
        promise = Promise.all([loadLatinWords(), loadLexicon()])
            .then(([words, lexicon]) => words.map(word => transliterate(word, 'lotin', alphabet, lexicon)))
            .catch(error => {
                converted.delete(alphabet);
                throw error;
            });
        converted.set(alphabet, promise);
    }
    return promise;
};

/** `public/words/uz-sentences.txt`: har qatorda bitta gap (`npm run typing:sentences`). */
export const parseSentenceList = (raw: string): string[] =>
    raw
        .split('\n')
        .map(line => normalizeTypingText(line.trim()))
        .filter(line => line !== '' && !line.startsWith('#'));

const sentencesPromises = new Map<Alphabet, Promise<string[]>>();

/** "Gaplar" rejimi uchun gaplar to'plami (har bir yozuv uchun bir marta tayyorlanadi). */
export const loadTypingSentences = (alphabet: Alphabet = 'lotin'): Promise<string[]> => {
    let promise = sentencesPromises.get(alphabet);
    if (!promise) {
        const latin = fetch('/words/uz-sentences.txt')
            .then(response => {
                if (!response.ok) throw new Error(`Gaplar yuklanmadi (${response.status})`);
                return response.text();
            })
            .then(parseSentenceList);
        promise = (
            alphabet === 'lotin'
                ? latin
                : Promise.all([latin, loadLexicon()]).then(([sentences, lexicon]) =>
                      sentences.map(sentence => normalizeTypingText(transliterate(sentence, 'lotin', alphabet, lexicon)))
                  )
        ).catch(error => {
            sentencesPromises.delete(alphabet);
            throw error;
        });
        sentencesPromises.set(alphabet, promise);
    }
    return promise;
};

/** Mashq uchun so'zlar to'plami: rejimga qarab alohida so'zlar yoki gaplar. */
export const loadTypingPool = (config: TypingConfig): Promise<string[]> =>
    config.mode === 'sentences' ? loadTypingSentences(config.alphabet) : loadTypingWords(config.alphabet);

const randomInt = (max: number) => Math.floor(Math.random() * max);

/** `count` ta tasodifiy gap (ketma-ket takrorlanmaydi) so'zlarga ajratilgan holda. */
export const createSentenceWords = (pool: string[], count: number): string[] => {
    const words: string[] = [];
    let last = -1;
    for (let i = 0; i < count; i++) {
        let index = randomInt(pool.length);
        if (index === last && pool.length > 1) index = (index + 1) % pool.length;
        last = index;
        words.push(...pool[index].split(' ').filter(word => word !== ''));
    }
    return words;
};

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
