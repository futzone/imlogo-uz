import { TypingConfig } from './config';
import { isSameTypingChar, isTypedWordCorrect } from './text';

/** Mashqning bir soniyalik kesimi (natija grafigi uchun). */
export interface TypingSample {
    second: number;
    wpm: number;
    raw: number;
    errors: number;
}

export interface TypingStats {
    /** Daqiqasiga so'z: faqat to'g'ri terilgan so'zlarning belgilari / 5. */
    wpm: number;
    /** Xatolarni hisobga olmagan "xom" tezlik. */
    raw: number;
    /** To'g'ri bosilgan klavishlar foizi. */
    accuracy: number;
    /** Tezlikning barqarorligi (0–100). */
    consistency: number;
    correctChars: number;
    incorrectChars: number;
    extraChars: number;
    missedChars: number;
}

/** So'zdan ortiqcha terilishi mumkin bo'lgan belgilar soni. */
const MAX_EXTRA_CHARS = 8;
const TIME_MODE_BUFFER = 60;

/**
 * Tez yozish mashqining holati va hisob-kitobi. UI'dan mustaqil: vaqt
 * tashqaridan (millisoniyalarda) beriladi.
 */
export class TypingEngine {
    readonly words: string[] = [];
    readonly typed: string[] = [];
    readonly samples: TypingSample[] = [];

    current = '';
    started = false;
    finished = false;
    finishedAt: number | null = null;

    private correctKeys = 0;
    private incorrectKeys = 0;
    private secondKeys = 0;
    private secondErrors = 0;

    private readonly nextWord: (() => string) | null;

    /**
     * `source` — so'z beruvchi funksiya (vaqt va so'zlar rejimi) yoki tayyor
     * so'zlar ro'yxati (gaplar rejimi: mashq shu so'zlar terilganda tugaydi).
     */
    constructor(
        readonly config: TypingConfig,
        source: (() => string) | readonly string[]
    ) {
        if (typeof source === 'function') {
            this.nextWord = source;
        } else {
            this.nextWord = null;
            this.words.push(...source);
        }
        this.fill();
    }

    /** Mashq so'zlar soni bilan cheklangan (vaqt rejimidan tashqari hammasi). */
    private get fixedLength(): boolean {
        return this.config.mode !== 'time';
    }

    get index(): number {
        return this.typed.length;
    }

    get target(): string {
        return this.words[this.index];
    }

    private fill() {
        if (!this.nextWord) return;
        const wanted = this.config.mode === 'words' ? this.config.amount : this.typed.length + TIME_MODE_BUFFER;
        while (this.words.length < wanted) this.words.push(this.nextWord());
    }

    private keystroke(correct: boolean) {
        this.started = true;
        this.secondKeys++;
        if (correct) {
            this.correctKeys++;
        } else {
            this.incorrectKeys++;
            this.secondErrors++;
        }
    }

    /**
     * Joriy so'z uchun kiritilgan matnni yangilaydi. Qo'shilgan har bir yangi
     * belgi klavish bosilishi sifatida hisoblanadi.
     */
    setCurrent(value: string, elapsedMs = 0) {
        if (this.finished) return;
        this.sampleUntil(elapsedMs);
        this.checkTime(elapsedMs);
        if (this.finished) return;
        const target = this.target;
        value = value.replace(/\s/g, '').slice(0, target.length + MAX_EXTRA_CHARS);
        if (value === this.current) return;

        let common = 0;
        while (common < value.length && common < this.current.length && value[common] === this.current[common]) {
            common++;
        }
        for (let i = common; i < value.length; i++) {
            this.keystroke(i < target.length && isSameTypingChar(value[i], target[i]));
        }
        this.current = value;

        // So'zlar va gaplar rejimida oxirgi so'z to'g'ri terilishi bilan mashq yakunlanadi.
        const isLastWord = this.fixedLength && this.index === this.words.length - 1;
        if (isLastWord && isTypedWordCorrect(this.current, target)) this.commit(elapsedMs);
    }

    /** Bo'sh joy: joriy so'zni yakunlab, keyingisiga o'tadi. */
    commitWord(elapsedMs = 0) {
        if (this.finished || this.current === '') return;
        this.sampleUntil(elapsedMs);
        this.checkTime(elapsedMs);
        if (this.finished) return;
        this.keystroke(true);
        this.commit(elapsedMs);
    }

    private commit(elapsedMs: number) {
        this.typed.push(this.current);
        this.current = '';
        if (this.fixedLength && this.typed.length >= this.words.length) {
            this.finish(elapsedMs);
        } else {
            this.fill();
        }
    }

    /** Bo'sh holatda o'chirish: oldingi so'z xato terilgan bo'lsa, unga qaytadi. */
    backToPreviousWord(): boolean {
        if (this.finished || this.current !== '' || this.typed.length === 0) return false;
        const previous = this.typed[this.typed.length - 1];
        if (isTypedWordCorrect(previous, this.words[this.typed.length - 1])) return false;
        this.typed.pop();
        this.current = previous;
        return true;
    }

    /**
     * Muntazam chaqiriladi: har soniyada grafik uchun kesim yozadi va vaqt
     * rejimida belgilangan vaqt tugagach mashqni yakunlaydi.
     */
    tick(elapsedMs: number) {
        if (!this.started || this.finished) return;
        this.sampleUntil(elapsedMs);
        this.checkTime(elapsedMs);
    }

    /** Vaqt rejimida vaqt tugagan bo'lsa (taymer kechikkan bo'lsa ham), keyingi bosishlar hisobga olinmaydi. */
    private checkTime(elapsedMs: number) {
        if (this.started && this.config.mode === 'time' && elapsedMs >= this.config.amount * 1000) {
            this.finish(this.config.amount * 1000);
        }
    }

    /**
     * O'tgan soniya kesimini yozadi. Klavish bosilganda ham chaqiriladi: taymer
     * kechiksa (sahifa band, energiya tejash rejimi), bosishlar keyingi
     * soniyaga o'tib ketmasin va so'zlar rejimida yakunda yo'qolmasin —
     * server kesimlardagi bosishlar sonini natija bilan solishtiradi.
     *
     * Har bir to'liq soniya uchun alohida kesim soniya chegarasidagi holat
     * bo'yicha yoziladi (chaqiruv payti emas) — natija taymerga bog'liq emas va
     * server bosishlar logini qayta o'ynaganda aynan shu kesimlar chiqadi.
     */
    private sampleUntil(elapsedMs: number) {
        if (!this.started) return;
        let until = Math.floor(elapsedMs / 1000);
        if (this.config.mode === 'time') until = Math.min(until, this.config.amount);
        while (this.samples.length < until) {
            const second = this.samples.length + 1;
            this.samples.push({
                second,
                wpm: this.stats(second * 1000).wpm,
                raw: this.secondKeys * 12,
                errors: this.secondErrors,
            });
            this.secondKeys = 0;
            this.secondErrors = 0;
        }
    }

    private finish(elapsedMs: number) {
        this.finished = true;
        this.finishedAt = elapsedMs;
    }

    stats(elapsedMs: number): TypingStats {
        let correct = 0;
        let incorrect = 0;
        let extra = 0;
        let missed = 0;
        let wpmChars = 0;

        for (let i = 0; i < this.typed.length; i++) {
            const input = this.typed[i];
            const word = this.words[i];
            const shared = Math.min(input.length, word.length);
            for (let j = 0; j < shared; j++) {
                if (isSameTypingChar(input[j], word[j])) correct++;
                else incorrect++;
            }
            if (input.length > word.length) extra += input.length - word.length;
            if (input.length < word.length) missed += word.length - input.length;

            if (isTypedWordCorrect(input, word)) {
                // So'zdan keyingi bo'sh joy ham hisobga olinadi (eng oxirgi so'zdan tashqari).
                const hasSpace = !this.fixedLength || i < this.words.length - 1;
                wpmChars += word.length + (hasSpace ? 1 : 0);
            }
        }

        // Vaqt tugaganda yarim terilgan so'z: xatosiz bo'lsa, hisobga qo'shiladi.
        if (this.current !== '') {
            const word = this.target;
            let prefixCorrect = this.current.length <= word.length;
            for (let j = 0; j < this.current.length; j++) {
                if (j < word.length && isSameTypingChar(this.current[j], word[j])) {
                    correct++;
                } else if (j < word.length) {
                    incorrect++;
                    prefixCorrect = false;
                } else {
                    extra++;
                }
            }
            if (prefixCorrect) wpmChars += this.current.length;
        }

        const minutes = elapsedMs / 60000;
        const keys = this.correctKeys + this.incorrectKeys;

        return {
            wpm: minutes <= 0 ? 0 : wpmChars / 5 / minutes,
            raw: minutes <= 0 ? 0 : keys / 5 / minutes,
            accuracy: keys === 0 ? 0 : (this.correctKeys / keys) * 100,
            consistency: this.consistency(),
            correctChars: correct,
            incorrectChars: incorrect,
            extraChars: extra,
            missedChars: missed,
        };
    }

    private consistency(): number {
        if (this.samples.length < 2) return 0;
        const values = this.samples.map(s => s.raw);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        if (mean <= 0) return 0;
        const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
        return (1 - Math.min(1, Math.sqrt(variance) / mean)) * 100;
    }
}
