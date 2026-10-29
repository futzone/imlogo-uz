import { TypingConfig } from './config';
import { TypingEngine } from './engine';
import { TypingInputEvent, TypingLogEntry } from './guard';
import { applyTypingValue, TypingInputState } from './input';
import { isTypedWordCorrect } from './text';

export interface TypingReplay {
    engine: TypingEngine;
    events: TypingInputEvent[];
}

/**
 * Bosishlar logini berilgan so'zlar ustida qaytadan o'ynaydi: natija
 * (WPM, aniqlik, barqarorlik, kesimlar) brauzerdagi bilan bir xil chiqadi.
 * Vaqt rejimida mashq belgilangan vaqtda yakunlanadi; so'zlar va gaplar
 * rejimida esa oxirgi so'z terilmagan bo'lsa, `engine.finished` — `false`.
 */
export const replayTypingLog = (config: TypingConfig, words: readonly string[], log: readonly TypingLogEntry[]): TypingReplay => {
    const engine = new TypingEngine(config, words);
    const state: TypingInputState = { pending: null };
    const events: TypingInputEvent[] = [];

    for (const entry of log) {
        // So'zlar tugagan bo'lsa (vaqt rejimida odam uchun imkonsiz tezlik) — log shu yerda to'xtaydi.
        if (engine.finished || engine.target === undefined) break;
        const before = engine.current.length;
        // Bo'sh holatda "o'chirish" — qo'shilgan belgi yo'q.
        const added = entry.v === null ? 0 : Math.max(0, entry.v.length - before);
        events.push({ t: entry.t, added, it: entry.it, keyed: entry.k !== null });
        applyTypingValue(engine, state, entry.v, entry.t);
    }

    if (config.mode === 'time' && engine.started) engine.tick(config.amount * 1000);
    return { engine, events };
};

/** So'z statistikasi uchun: kichik harf, chetidagi tinish belgilari olib tashlanadi. */
// Lotin (o‘, ş, ç va h.k.) va kirill harflari; serverdagi JS dvigateli uchun `\p{L}` ishlatilmaydi.
const LETTER = /[a-zA-Z\u00C0-\u024F\u0400-\u04FF]/;
const statsWord = (word: string): string => {
    const lower = word.toLowerCase();
    let start = 0;
    let end = lower.length;
    while (start < end && !LETTER.test(lower[start])) start++;
    while (end > start && !LETTER.test(lower[end - 1])) end--;
    return lower.slice(start, end);
};

export interface TypingWordAttempt {
    word: string;
    /** So'z terilayotganda kamida bitta xato klavish bosilgan (tuzatilgan bo'lsa ham) yoki oxirida noto'g'ri qolgan. */
    mistaken: boolean;
}

/**
 * Yakunlangan (bo'sh joy bilan o'tilgan) so'zlar bo'yicha xatolar — "Qiyin
 * so'zlar" reytingi uchun. Harfsiz bo'laklar (raqamlar, tinish belgilari) olinmaydi.
 */
export const typingWordAttempts = (engine: TypingEngine): TypingWordAttempt[] => {
    const attempts: TypingWordAttempt[] = [];
    for (let i = 0; i < engine.typed.length; i++) {
        const word = statsWord(engine.words[i]);
        if (word === '' || word.length > 40) continue;
        const mistaken = (engine.wordErrors[i] ?? 0) > 0 || !isTypedWordCorrect(engine.typed[i], engine.words[i]);
        attempts.push({ word, mistaken });
    }
    return attempts;
};
