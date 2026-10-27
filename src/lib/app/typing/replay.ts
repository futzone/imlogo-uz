import { TypingConfig } from './config';
import { TypingEngine } from './engine';
import { TypingInputEvent, TypingLogEntry } from './guard';
import { applyTypingValue, TypingInputState } from './input';

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
