/**
 * Avtomatik (script bilan) yozishni aniqlash. Odam klavishlarni hech qachon
 * bir maromda bosmaydi: bosishlar orasidagi vaqt odatda o'rtachadan 30–80%
 * ga farq qiladi. Script esa (`setInterval`, `keyboard.type({ delay })`)
 * deyarli bir xil oraliqda yozadi.
 */

/** Shundan uzun to'xtash (o'ylash, chalg'ish) maromga qo'shilmaydi. */
const MAX_INTERVAL_MS = 2000;
/** Xulosa uchun kamida shuncha oraliq kerak. */
const MIN_INTERVALS = 20;
/** Oraliqlar o'zgaruvchanligi (CV) bundan past bo'lsa — odam emas. */
const MIN_HUMAN_VARIATION = 0.1;

/** `times` — har bir bosish payti (millisoniya, o'sish tartibida). */
export const isRoboticTyping = (times: number[]): boolean => {
    const intervals: number[] = [];
    for (let i = 1; i < times.length; i++) {
        const interval = times[i] - times[i - 1];
        if (interval <= MAX_INTERVAL_MS) intervals.push(interval);
    }
    if (intervals.length < MIN_INTERVALS) return false;

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    // Bir hodisada bir nechta belgi (oraliq 0) — ham odamga xos emas.
    if (mean <= 0) return true;
    const variance = intervals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / intervals.length;
    return Math.sqrt(variance) / mean < MIN_HUMAN_VARIATION;
};
