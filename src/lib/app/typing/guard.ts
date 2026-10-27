/**
 * Tez yozish natijasini avtomatik yozish (script), nusxalab qo'yish va
 * soxtalashtirishdan himoyalash evristikalari. Brauzer ham, server ham shu
 * koddan foydalanadi: brauzer natijani darhol belgilaydi, server esa
 * bosishlar logini qayta o'ynab, qaror qabul qiladi.
 *
 * Odam klavishlarni hech qachon bir maromda bosmaydi va bir zumda ko'p belgi
 * kirita olmaydi; script (`setInterval`, `keyboard.type({ delay })`, `execCommand`)
 * esa aynan shunday qiladi.
 */

/** Kiritish maydonidagi bitta o'zgarish (brauzer yozadi, server qayta o'ynaydi). */
export interface TypingLogEntry {
    /** Mashq boshidan beri o'tgan vaqt, ms (`performance.now()` bo'yicha). */
    t: number;
    /** Maydondagi matn yoki `null` — bo'sh holatda "o'chirish" bosildi (qarang: applyTypingValue). */
    v: string | null;
    /** Brauzer hodisasi turi (`InputEvent.inputType`). */
    it: string;
    /** Shu o'zgarishdan oldin bosilgan klavish (`KeyboardEvent.key`); bosilmagan bo'lsa — `null`. */
    k: string | null;
}

/** Qayta o'ynash natijasida har bir o'zgarish: nechta belgi qo'shildi. */
export interface TypingInputEvent {
    t: number;
    added: number;
    it: string;
    keyed: boolean;
}

export interface TypingGuardConfig {
    /** Shu oynada (ms) `burstMaxChars` dan ko'p belgi bo'lsa — bir zumda kiritilgan. */
    burstWindowMs: number;
    burstMaxChars: number;
    /** Bir soniyalik oynada shundan ko'p belgi — odam uchun imkonsiz tezlik. */
    secondMaxChars: number;
    /** Belgilar orasidagi o'rtacha vaqt (ms) bundan kam bo'lmasligi kerak. */
    minMeanIntervalMs: number;
    /** Oraliqlar o'zgaruvchanligi (CV) bundan past bo'lsa — bir xil maromda, odam emas. */
    minIntervalVariation: number;
    /** Xulosa uchun kamida shuncha oraliq kerak. */
    minIntervals: number;
    /** Shundan uzun to'xtash (o'ylash, chalg'ish) maromga qo'shilmaydi. */
    maxIntervalMs: number;
    maxWpm: number;
    /** Bir hodisada bir nechta belgi kiritgan `insertText` lar soni shundan oshmasin. */
    maxMultiInserts: number;
    /** Klavish bosilmasdan kiritilgan o'zgarishlar ulushi (mobil klaviaturalar uchun ozgina ruxsat). */
    maxUnkeyedRatio: number;
}

export const defaultTypingGuardConfig: TypingGuardConfig = {
    burstWindowMs: 100,
    burstMaxChars: 8,
    secondMaxChars: 25,
    minMeanIntervalMs: 25,
    minIntervalVariation: 0.1,
    minIntervals: 20,
    maxIntervalMs: 2000,
    maxWpm: 250,
    maxMultiInserts: 0,
    maxUnkeyedRatio: 0.1,
};

export type TypingFlag =
    | 'burst'
    | 'second_burst'
    | 'fast_intervals'
    | 'uniform_rhythm'
    | 'wpm'
    | 'multi_insert'
    | 'no_keydown'
    | 'server_time'
    | 'unverified';

export const typingFlagMessages: Record<TypingFlag, string> = {
    burst: 'bir zumda köp belgi kiritilgan',
    second_burst: 'odam uçun imkonsiz tezlik',
    fast_intervals: 'belgilar orasidagi vaqt juda qisqa',
    uniform_rhythm: 'avtomatik yozişga öxşaydi',
    wpm: 'tezlik 250 WPM dan yuqori',
    multi_insert: 'matn bir yöla kiritilgan',
    no_keydown: 'matn klavişsiz kiritilgan',
    server_time: 'vaqt server vaqtiga mos emas',
    unverified: 'natija serverda tekşirilmadi',
};

/** Har bir qo'shilgan belgining payti (bir hodisada bir nechta belgi — bir xil payt). */
const charTimes = (events: TypingInputEvent[]): number[] => {
    const times: number[] = [];
    for (const event of events) for (let i = 0; i < event.added; i++) times.push(event.t);
    return times;
};

/** `times` ichida `windowMs` dan qisqa oraliqqa `count` ta belgi sig'adimi. */
const hasDenseWindow = (times: number[], count: number, windowMs: number): boolean => {
    for (let i = 0; i + count - 1 < times.length; i++) {
        if (times[i + count - 1] - times[i] < windowMs) return true;
    }
    return false;
};

/** Natijani shubhali qiladigan belgilar (bo'sh ro'yxat — hammasi joyida). */
export const analyzeTyping = (
    events: TypingInputEvent[],
    wpm: number,
    config: TypingGuardConfig = defaultTypingGuardConfig
): TypingFlag[] => {
    const flags: TypingFlag[] = [];
    const times = charTimes(events);

    if (hasDenseWindow(times, config.burstMaxChars + 1, config.burstWindowMs)) flags.push('burst');
    if (hasDenseWindow(times, config.secondMaxChars + 1, 1000)) flags.push('second_burst');

    const intervals: number[] = [];
    for (let i = 1; i < times.length; i++) {
        const interval = times[i] - times[i - 1];
        if (interval <= config.maxIntervalMs) intervals.push(interval);
    }
    if (intervals.length >= config.minIntervals) {
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        if (mean < config.minMeanIntervalMs) flags.push('fast_intervals');
        const variance = intervals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / intervals.length;
        if (mean <= 0 || Math.sqrt(variance) / mean < config.minIntervalVariation) flags.push('uniform_rhythm');
    }

    if (wpm > config.maxWpm) flags.push('wpm');

    const inserts = events.filter(event => event.added > 0);
    const multi = inserts.filter(event => event.it === 'insertText' && event.added > 1).length;
    if (multi > config.maxMultiInserts) flags.push('multi_insert');
    const unkeyed = inserts.filter(event => !event.keyed).length;
    if (unkeyed > 0 && unkeyed / Math.max(1, inserts.length) > config.maxUnkeyedRatio) flags.push('no_keydown');

    return flags;
};
