import { composeYangi } from './compose';
import { TypingEngine } from './engine';

/**
 * Kiritish maydonidagi yangi qiymatni dvigatelga uzatadi. Brauzer ham, server
 * ham (bosishlar logini qayta o'ynaganda) aynan shu funksiyadan foydalanadi —
 * shuning uchun natija ikkala tomonda bir xil chiqadi.
 *
 * `value` — maydondagi matn (ko'rinmas boshlang'ich belgisiz) yoki `null`:
 * o'sha belgi o'chirildi, ya'ni bo'sh holatda "o'chirish" bosildi.
 */
export interface TypingInputState {
    /** Yangi alifbo: "s" terilib, "h" kutilayotgan harf o'rni (qarang: composeYangi). */
    pending: number | null;
}

export const applyTypingValue = (
    engine: TypingEngine,
    state: TypingInputState,
    value: string | null,
    elapsedMs: number
) => {
    if (value === null) {
        state.pending = null;
        engine.backToPreviousWord();
        return;
    }
    const space = value.search(/\s/);
    let word = space >= 0 ? value.slice(0, space) : value;
    if (engine.config.alphabet === 'yangi') {
        const composed = composeYangi(engine.current, word, engine.target, state.pending, space >= 0);
        word = composed.value;
        state.pending = composed.pending;
    }
    engine.setCurrent(word, elapsedMs);
    if (space >= 0) {
        state.pending = null;
        engine.commitWord(elapsedMs);
    }
};
