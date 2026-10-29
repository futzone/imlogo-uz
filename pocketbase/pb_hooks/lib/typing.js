// Avtomatik yaratilgan: npm run pb:lib — qo‘lda o‘zgartirmang.

const __modules = {
"lib/app/typing/replay.ts": function (exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typingWordAttempts = exports.replayTypingLog = void 0;
const engine_1 = __require("lib/app/typing/engine.ts");
const input_1 = __require("lib/app/typing/input.ts");
const text_1 = __require("lib/app/typing/text.ts");
/**
 * Bosishlar logini berilgan so'zlar ustida qaytadan o'ynaydi: natija
 * (WPM, aniqlik, barqarorlik, kesimlar) brauzerdagi bilan bir xil chiqadi.
 * Vaqt rejimida mashq belgilangan vaqtda yakunlanadi; so'zlar va gaplar
 * rejimida esa oxirgi so'z terilmagan bo'lsa, `engine.finished` — `false`.
 */
const replayTypingLog = (config, words, log) => {
    const engine = new engine_1.TypingEngine(config, words);
    const state = { pending: null };
    const events = [];
    for (const entry of log) {
        // So'zlar tugagan bo'lsa (vaqt rejimida odam uchun imkonsiz tezlik) — log shu yerda to'xtaydi.
        if (engine.finished || engine.target === undefined)
            break;
        const before = engine.current.length;
        // Bo'sh holatda "o'chirish" — qo'shilgan belgi yo'q.
        const added = entry.v === null ? 0 : Math.max(0, entry.v.length - before);
        events.push({ t: entry.t, added, it: entry.it, keyed: entry.k !== null });
        (0, input_1.applyTypingValue)(engine, state, entry.v, entry.t);
    }
    if (config.mode === 'time' && engine.started)
        engine.tick(config.amount * 1000);
    return { engine, events };
};
exports.replayTypingLog = replayTypingLog;
/** So'z statistikasi uchun: kichik harf, chetidagi tinish belgilari olib tashlanadi. */
// Lotin (o‘, ş, ç va h.k.) va kirill harflari; serverdagi JS dvigateli uchun `\p{L}` ishlatilmaydi.
const LETTER = /[a-zA-Z\u00C0-\u024F\u0400-\u04FF]/;
const statsWord = (word) => {
    const lower = word.toLowerCase();
    let start = 0;
    let end = lower.length;
    while (start < end && !LETTER.test(lower[start]))
        start++;
    while (end > start && !LETTER.test(lower[end - 1]))
        end--;
    return lower.slice(start, end);
};
/**
 * Yakunlangan (bo'sh joy bilan o'tilgan) so'zlar bo'yicha xatolar — "Qiyin
 * so'zlar" reytingi uchun. Harfsiz bo'laklar (raqamlar, tinish belgilari) olinmaydi.
 */
const typingWordAttempts = (engine) => {
    var _a;
    const attempts = [];
    for (let i = 0; i < engine.typed.length; i++) {
        const word = statsWord(engine.words[i]);
        if (word === '' || word.length > 40)
            continue;
        const mistaken = ((_a = engine.wordErrors[i]) !== null && _a !== void 0 ? _a : 0) > 0 || !(0, text_1.isTypedWordCorrect)(engine.typed[i], engine.words[i]);
        attempts.push({ word, mistaken });
    }
    return attempts;
};
exports.typingWordAttempts = typingWordAttempts;

},
"lib/app/typing/engine.ts": function (exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypingEngine = void 0;
const text_1 = __require("lib/app/typing/text.ts");
/** So'zdan ortiqcha terilishi mumkin bo'lgan belgilar soni. */
const MAX_EXTRA_CHARS = 8;
const TIME_MODE_BUFFER = 60;
/**
 * Tez yozish mashqining holati va hisob-kitobi. UI'dan mustaqil: vaqt
 * tashqaridan (millisoniyalarda) beriladi.
 */
class TypingEngine {
    /**
     * `source` — so'z beruvchi funksiya (vaqt va so'zlar rejimi) yoki tayyor
     * so'zlar ro'yxati (gaplar rejimi: mashq shu so'zlar terilganda tugaydi).
     */
    constructor(config, source) {
        this.config = config;
        this.words = [];
        this.typed = [];
        this.samples = [];
        /** Har bir so'z (indeks bo'yicha) terilayotganda bosilgan xato klavishlar soni — tuzatilganlari ham. */
        this.wordErrors = [];
        this.current = '';
        this.started = false;
        this.finished = false;
        this.finishedAt = null;
        this.correctKeys = 0;
        this.incorrectKeys = 0;
        this.secondKeys = 0;
        this.secondErrors = 0;
        if (typeof source === 'function') {
            this.nextWord = source;
        }
        else {
            this.nextWord = null;
            this.words.push(...source);
        }
        this.fill();
    }
    /** Mashq so'zlar soni bilan cheklangan (vaqt rejimidan tashqari hammasi). */
    get fixedLength() {
        return this.config.mode !== 'time';
    }
    get index() {
        return this.typed.length;
    }
    get target() {
        return this.words[this.index];
    }
    fill() {
        if (!this.nextWord)
            return;
        const wanted = this.config.mode === 'words' ? this.config.amount : this.typed.length + TIME_MODE_BUFFER;
        while (this.words.length < wanted)
            this.words.push(this.nextWord());
    }
    keystroke(correct) {
        var _a;
        this.started = true;
        this.secondKeys++;
        if (correct) {
            this.correctKeys++;
        }
        else {
            this.incorrectKeys++;
            this.secondErrors++;
            this.wordErrors[this.index] = ((_a = this.wordErrors[this.index]) !== null && _a !== void 0 ? _a : 0) + 1;
        }
    }
    /**
     * Joriy so'z uchun kiritilgan matnni yangilaydi. Qo'shilgan har bir yangi
     * belgi klavish bosilishi sifatida hisoblanadi.
     */
    setCurrent(value, elapsedMs = 0) {
        if (this.finished)
            return;
        this.sampleUntil(elapsedMs);
        this.checkTime(elapsedMs);
        if (this.finished)
            return;
        const target = this.target;
        value = value.replace(/\s/g, '').slice(0, target.length + MAX_EXTRA_CHARS);
        if (value === this.current)
            return;
        let common = 0;
        while (common < value.length && common < this.current.length && value[common] === this.current[common]) {
            common++;
        }
        for (let i = common; i < value.length; i++) {
            this.keystroke(i < target.length && (0, text_1.isSameTypingChar)(value[i], target[i]));
        }
        this.current = value;
        // So'zlar va gaplar rejimida oxirgi so'z to'g'ri terilishi bilan mashq yakunlanadi.
        const isLastWord = this.fixedLength && this.index === this.words.length - 1;
        if (isLastWord && (0, text_1.isTypedWordCorrect)(this.current, target))
            this.commit(elapsedMs);
    }
    /** Bo'sh joy: joriy so'zni yakunlab, keyingisiga o'tadi. */
    commitWord(elapsedMs = 0) {
        if (this.finished || this.current === '')
            return;
        this.sampleUntil(elapsedMs);
        this.checkTime(elapsedMs);
        if (this.finished)
            return;
        this.keystroke(true);
        this.commit(elapsedMs);
    }
    commit(elapsedMs) {
        this.typed.push(this.current);
        this.current = '';
        if (this.fixedLength && this.typed.length >= this.words.length) {
            this.finish(elapsedMs);
        }
        else {
            this.fill();
        }
    }
    /** Bo'sh holatda o'chirish: oldingi so'z xato terilgan bo'lsa, unga qaytadi. */
    backToPreviousWord() {
        if (this.finished || this.current !== '' || this.typed.length === 0)
            return false;
        const previous = this.typed[this.typed.length - 1];
        if ((0, text_1.isTypedWordCorrect)(previous, this.words[this.typed.length - 1]))
            return false;
        this.typed.pop();
        this.current = previous;
        return true;
    }
    /**
     * Muntazam chaqiriladi: har soniyada grafik uchun kesim yozadi va vaqt
     * rejimida belgilangan vaqt tugagach mashqni yakunlaydi.
     */
    tick(elapsedMs) {
        if (!this.started || this.finished)
            return;
        this.sampleUntil(elapsedMs);
        this.checkTime(elapsedMs);
    }
    /** Vaqt rejimida vaqt tugagan bo'lsa (taymer kechikkan bo'lsa ham), keyingi bosishlar hisobga olinmaydi. */
    checkTime(elapsedMs) {
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
    sampleUntil(elapsedMs) {
        if (!this.started)
            return;
        let until = Math.floor(elapsedMs / 1000);
        if (this.config.mode === 'time')
            until = Math.min(until, this.config.amount);
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
    finish(elapsedMs) {
        this.finished = true;
        this.finishedAt = elapsedMs;
    }
    stats(elapsedMs) {
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
                if ((0, text_1.isSameTypingChar)(input[j], word[j]))
                    correct++;
                else
                    incorrect++;
            }
            if (input.length > word.length)
                extra += input.length - word.length;
            if (input.length < word.length)
                missed += word.length - input.length;
            if ((0, text_1.isTypedWordCorrect)(input, word)) {
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
                if (j < word.length && (0, text_1.isSameTypingChar)(this.current[j], word[j])) {
                    correct++;
                }
                else if (j < word.length) {
                    incorrect++;
                    prefixCorrect = false;
                }
                else {
                    extra++;
                }
            }
            if (prefixCorrect)
                wpmChars += this.current.length;
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
    consistency() {
        if (this.samples.length < 2)
            return 0;
        const values = this.samples.map(s => s.raw);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        if (mean <= 0)
            return 0;
        const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
        return (1 - Math.min(1, Math.sqrt(variance) / mean)) * 100;
    }
}
exports.TypingEngine = TypingEngine;

},
"lib/app/typing/text.ts": function (exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettifyTypingWord = exports.isTypedWordCorrect = exports.isSameTypingChar = exports.normalizeTypingText = exports.normalizeTypingChar = void 0;
/**
 * O'zbek lotin yozuvida o‘, g‘ va tutuq belgisi turli klaviaturalarda
 * turlicha teriladi: ' ’ ‘ ʻ ʼ ` ´. Tez yozish mashqida ularning barchasi
 * bitta belgi sifatida qabul qilinadi ("yumshoq" tekshiruv).
 */
const APOSTROPHES = new Set(["'", '‘', '’', 'ʻ', 'ʼ', '`', '´', '′', 'ʹ']);
const normalizeTypingChar = (char) => (APOSTROPHES.has(char) ? "'" : char);
exports.normalizeTypingChar = normalizeTypingChar;
const normalizeTypingText = (text) => text.split('').map(exports.normalizeTypingChar).join('');
exports.normalizeTypingText = normalizeTypingText;
const isSameTypingChar = (a, b) => (0, exports.normalizeTypingChar)(a) === (0, exports.normalizeTypingChar)(b);
exports.isSameTypingChar = isSameTypingChar;
/** So'z to'liq va xatosiz terilganmi. */
const isTypedWordCorrect = (input, target) => {
    if (input.length !== target.length)
        return false;
    for (let i = 0; i < target.length; i++) {
        if (!(0, exports.isSameTypingChar)(input[i], target[i]))
            return false;
    }
    return true;
};
exports.isTypedWordCorrect = isTypedWordCorrect;
/**
 * Ekranda ko'rsatish uchun: o/g dan keyin ‘ (o‘, g‘), qolgan hollarda ’
 * (tutuq belgisi). So'z uzunligi o'zgarmaydi.
 */
const prettifyTypingWord = (word) => {
    let result = '';
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (char === "'" && i > 0) {
            const prev = word[i - 1].toLowerCase();
            result += prev === 'o' || prev === 'g' ? '‘' : '’';
        }
        else {
            result += char;
        }
    }
    return result;
};
exports.prettifyTypingWord = prettifyTypingWord;

},
"lib/app/typing/input.ts": function (exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTypingValue = void 0;
const compose_1 = __require("lib/app/typing/compose.ts");
const applyTypingValue = (engine, state, value, elapsedMs) => {
    if (value === null) {
        state.pending = null;
        engine.backToPreviousWord();
        return;
    }
    const space = value.search(/\s/);
    let word = space >= 0 ? value.slice(0, space) : value;
    if (engine.config.alphabet === 'yangi') {
        const composed = (0, compose_1.composeYangi)(engine.current, word, engine.target, state.pending, space >= 0);
        word = composed.value;
        state.pending = composed.pending;
    }
    engine.setCurrent(word, elapsedMs);
    if (space >= 0) {
        state.pending = null;
        engine.commitWord(elapsedMs);
    }
};
exports.applyTypingValue = applyTypingValue;

},
"lib/app/typing/compose.ts": function (exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeYangi = void 0;
const text_1 = __require("lib/app/typing/text.ts");
/** Yangi alifbo harfi → oddiy klaviaturadagi ikki belgilik yozilishi. */
const DIGRAPHS = {
    ş: ['s', 'h'],
    ç: ['c', 'h'],
    ö: ['o', "'"],
    ğ: ['g', "'"],
};
const withCaseOf = (source, letter) => source !== source.toLowerCase() ? letter.toUpperCase() : letter;
/**
 * Yangi alifbo mashqi: Ş, Ç, Ö, Ğ harflari oddiy klaviaturada yo'q, shuning
 * uchun ular "sh", "ch", "o'", "g'" deb ham terilishi mumkin. Kutilgan harf
 * shulardan biri bo'lsa, birinchi belgi darhol shu harf sifatida ko'rsatiladi,
 * ikkinchisi esa "yutiladi". Ikkinchi belgi boshqa bo'lsa, harf oddiy s/c/o/g
 * ga qaytadi (xato). Ş va boshqalarni to'g'ridan-to'g'ri terish ham ishlaydi.
 *
 * `previous` — dvigateldagi joriy qiymat, `typed` — maydondagi yangi qiymat,
 * `finalize` — so'z bo'sh joy bilan yakunlanmoqda.
 */
const composeYangi = (previous, typed, target, pending, finalize = false) => {
    var _a;
    // O'chirish yoki tahrir — hech narsa o'zgartirilmaydi.
    if (!typed.startsWith(previous))
        return { value: typed, pending: null };
    let value = previous;
    let waiting = pending;
    const revert = () => {
        if (waiting === null)
            return;
        const special = value[waiting].toLowerCase();
        value = value.slice(0, waiting) + withCaseOf(value[waiting], DIGRAPHS[special][0]) + value.slice(waiting + 1);
        waiting = null;
    };
    for (const char of typed.slice(previous.length)) {
        if (waiting !== null && waiting === value.length - 1) {
            const second = DIGRAPHS[value[waiting].toLowerCase()][1];
            if ((0, text_1.normalizeTypingChar)(char.toLowerCase()) === second) {
                waiting = null;
                continue;
            }
            revert();
        }
        const expected = (_a = target[value.length]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const digraph = expected ? DIGRAPHS[expected] : undefined;
        if (digraph && char.toLowerCase() === digraph[0]) {
            value += withCaseOf(char, expected);
            waiting = value.length - 1;
        }
        else {
            value += char;
        }
    }
    if (finalize)
        revert();
    return { value, pending: waiting };
};
exports.composeYangi = composeYangi;

},
"lib/app/typing/guard.ts": function (exports) {
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTyping = exports.typingFlagMessages = exports.defaultTypingGuardConfig = void 0;
exports.defaultTypingGuardConfig = {
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
exports.typingFlagMessages = {
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
const charTimes = (events) => {
    const times = [];
    for (const event of events)
        for (let i = 0; i < event.added; i++)
            times.push(event.t);
    return times;
};
/** `times` ichida `windowMs` dan qisqa oraliqqa `count` ta belgi sig'adimi. */
const hasDenseWindow = (times, count, windowMs) => {
    for (let i = 0; i + count - 1 < times.length; i++) {
        if (times[i + count - 1] - times[i] < windowMs)
            return true;
    }
    return false;
};
/** Natijani shubhali qiladigan belgilar (bo'sh ro'yxat — hammasi joyida). */
const analyzeTyping = (events, wpm, config = exports.defaultTypingGuardConfig) => {
    const flags = [];
    const times = charTimes(events);
    if (hasDenseWindow(times, config.burstMaxChars + 1, config.burstWindowMs))
        flags.push('burst');
    if (hasDenseWindow(times, config.secondMaxChars + 1, 1000))
        flags.push('second_burst');
    const intervals = [];
    for (let i = 1; i < times.length; i++) {
        const interval = times[i] - times[i - 1];
        if (interval <= config.maxIntervalMs)
            intervals.push(interval);
    }
    if (intervals.length >= config.minIntervals) {
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        if (mean < config.minMeanIntervalMs)
            flags.push('fast_intervals');
        const variance = intervals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / intervals.length;
        if (mean <= 0 || Math.sqrt(variance) / mean < config.minIntervalVariation)
            flags.push('uniform_rhythm');
    }
    if (wpm > config.maxWpm)
        flags.push('wpm');
    const inserts = events.filter(event => event.added > 0);
    const multi = inserts.filter(event => event.it === 'insertText' && event.added > 1).length;
    if (multi > config.maxMultiInserts)
        flags.push('multi_insert');
    const unkeyed = inserts.filter(event => !event.keyed).length;
    if (unkeyed > 0 && unkeyed / Math.max(1, inserts.length) > config.maxUnkeyedRatio)
        flags.push('no_keydown');
    return flags;
};
exports.analyzeTyping = analyzeTyping;

},
"lib/app/typing/words.ts": function (exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWordGenerator = exports.createSentenceWords = exports.loadTypingPool = exports.loadTypingSentences = exports.parseSentenceList = exports.loadTypingWords = exports.parseWordList = void 0;
const core_1 = __require("lib/translit/core.ts");
const lexicon_1 = __require("lib/translit/lexicon.ts");
const text_1 = __require("lib/app/typing/text.ts");
/**
 * `public/words/uz.txt` formatidagi matnni so'zlar ro'yxatiga aylantiradi:
 * har bir qatorda bitta so'z, `#` bilan boshlangan qatorlar — izoh.
 */
const parseWordList = (raw) => {
    const words = new Set();
    for (const line of raw.split('\n')) {
        const word = (0, text_1.normalizeTypingText)(line.trim().toLowerCase());
        if (word === '' || word.startsWith('#') || word.includes(' '))
            continue;
        words.add(word);
    }
    return Array.from(words);
};
exports.parseWordList = parseWordList;
let wordsPromise = null;
const loadLatinWords = () => {
    wordsPromise !== null && wordsPromise !== void 0 ? wordsPromise : (wordsPromise = fetch('/words/uz.txt')
        .then(response => {
        if (!response.ok)
            throw new Error(`Sözlar yuklanmadi (${response.status})`);
        return response.text();
    })
        .then(exports.parseWordList)
        .catch(error => {
        wordsPromise = null;
        throw error;
    }));
    return wordsPromise;
};
const converted = new Map();
/**
 * Mashq uchun so'zlar to'plami (har bir yozuv uchun bir marta tayyorlanadi).
 * To'plam lotincha saqlanadi, yangi alifbo va kirillga lug'at yordamida o'giriladi.
 */
const loadTypingWords = (alphabet = 'lotin') => {
    if (alphabet === 'lotin')
        return loadLatinWords();
    let promise = converted.get(alphabet);
    if (!promise) {
        promise = Promise.all([loadLatinWords(), (0, lexicon_1.loadLexicon)()])
            .then(([words, lexicon]) => words.map(word => (0, core_1.transliterate)(word, 'lotin', alphabet, lexicon)))
            .catch(error => {
            converted.delete(alphabet);
            throw error;
        });
        converted.set(alphabet, promise);
    }
    return promise;
};
exports.loadTypingWords = loadTypingWords;
/** `public/words/uz-sentences.txt`: har qatorda bitta gap (`npm run typing:sentences`). */
const parseSentenceList = (raw) => raw
    .split('\n')
    .map(line => (0, text_1.normalizeTypingText)(line.trim()))
    .filter(line => line !== '' && !line.startsWith('#'));
exports.parseSentenceList = parseSentenceList;
const sentencesPromises = new Map();
/** "Gaplar" rejimi uchun gaplar to'plami (har bir yozuv uchun bir marta tayyorlanadi). */
const loadTypingSentences = (alphabet = 'lotin') => {
    let promise = sentencesPromises.get(alphabet);
    if (!promise) {
        const latin = fetch('/words/uz-sentences.txt')
            .then(response => {
            if (!response.ok)
                throw new Error(`Gaplar yuklanmadi (${response.status})`);
            return response.text();
        })
            .then(exports.parseSentenceList);
        promise = (alphabet === 'lotin'
            ? latin
            : Promise.all([latin, (0, lexicon_1.loadLexicon)()]).then(([sentences, lexicon]) => sentences.map(sentence => (0, text_1.normalizeTypingText)((0, core_1.transliterate)(sentence, 'lotin', alphabet, lexicon))))).catch(error => {
            sentencesPromises.delete(alphabet);
            throw error;
        });
        sentencesPromises.set(alphabet, promise);
    }
    return promise;
};
exports.loadTypingSentences = loadTypingSentences;
/** Mashq uchun so'zlar to'plami: rejimga qarab alohida so'zlar yoki gaplar. */
const loadTypingPool = (config) => config.mode === 'sentences' ? (0, exports.loadTypingSentences)(config.alphabet) : (0, exports.loadTypingWords)(config.alphabet);
exports.loadTypingPool = loadTypingPool;
const randomInt = (max) => Math.floor(Math.random() * max);
/** `count` ta tasodifiy gap (ketma-ket takrorlanmaydi) so'zlarga ajratilgan holda. */
const createSentenceWords = (pool, count) => {
    const words = [];
    let last = -1;
    for (let i = 0; i < count; i++) {
        let index = randomInt(pool.length);
        if (index === last && pool.length > 1)
            index = (index + 1) % pool.length;
        last = index;
        words.push(...pool[index].split(' ').filter(word => word !== ''));
    }
    return words;
};
exports.createSentenceWords = createSentenceWords;
const SENTENCE_ENDINGS = ['.', '.', '.', '?', '!'];
/** So'zlar to'plamidan mashq uchun tasodifiy so'zlar ketma-ketligini beradi. */
const createWordGenerator = (pool, config) => {
    let last = null;
    let sentenceStart = true;
    const punctuate = (word) => {
        if (!config.punctuation)
            return word;
        if (sentenceStart) {
            word = word[0].toUpperCase() + word.slice(1);
            sentenceStart = false;
        }
        const roll = randomInt(100);
        if (roll < 12) {
            sentenceStart = true;
            return word + SENTENCE_ENDINGS[randomInt(SENTENCE_ENDINGS.length)];
        }
        if (roll < 26)
            return `${word},`;
        if (roll < 29)
            return `${word};`;
        if (roll < 32)
            return `${word}:`;
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
exports.createWordGenerator = createWordGenerator;

},
"lib/translit/core.ts": function (exports) {
"use strict";
/**
 * O'zbek yozuvlari orasida transliteratsiya: kirill, amaldagi lotin (1995)
 * va yangi lotin alifbosi (ş, ç, ö, ğ).
 *
 * Ichki ko'rinishda lotin so'z kichik harflarda, "`" — oʻ/gʻ belgisi,
 * "'" — tutuq belgisi (ʼ) bilan yoziladi. Foydalanuvchi matnida bu ikkisi
 * farqlanmaydi, shuning uchun lug'at kalitlarida ikkalasi ham "'" bo'ladi.
 *
 * Bu fayl hech narsa import qilmaydi: lug'atni yig'uvchi skript
 * (`scripts/build-translit-lexicon.ts`) ham aynan shu qoidalardan foydalanadi.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLexicon = exports.transliterate = exports.yangiWordToLotin = exports.lotinWordToYangi = exports.lotinWordToCyr = exports.lookupLexicon = exports.naiveLatinToCyr = exports.toKey = exports.cyrWordToLatin = exports.MIN_PREFIX = exports.APOSTROPHES = void 0;
/** Foydalanuvchi oʻ/gʻ yoki tutuq uchun yozishi mumkin bo'lgan belgilar. */
exports.APOSTROPHES = "'`‘’ʻʼ´ʹ′";
const APOSTROPHE_RE = new RegExp(`[${exports.APOSTROPHES}]`, 'g');
const MODIFIER = 'ʻ'; // U+02BB — oʻ, gʻ
const TUTUQ = 'ʼ'; // U+02BC — tutuq belgisi
/** Prefiks bo'yicha qidirilganda lug'at kalitining eng kichik uzunligi. */
exports.MIN_PREFIX = 5;
const CYR_VOWELS = 'аеёиоуэюяў';
const CYR_COMMON = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'x', э: 'e', ю: 'yu', я: 'ya', қ: 'q', ҳ: 'h', ъ: "'", ы: 'i',
};
const CYR_LOTIN = { ш: 'sh', ч: 'ch', щ: 'shch', ў: 'o`', ғ: 'g`' };
const CYR_YANGI = { ш: 'ş', ч: 'ç', щ: 'şç', ў: 'ö', ғ: 'ğ' };
/** Rasmiy yozilishi qoidadan farq qiladigan so'z boshlari. */
const CYR_OVERRIDES = [
    ['сентябр', 'sentabr'],
    ['октябр', 'oktabr'],
];
/** Kirillcha so'zni (kichik harflarda) ichki lotin ko'rinishiga o'giradi. */
const cyrWordToLatin = (word, target) => {
    var _a, _b;
    const special = target === 'yangi' ? CYR_YANGI : CYR_LOTIN;
    let out = '';
    let start = 0;
    for (const [prefix, latin] of CYR_OVERRIDES) {
        if (word.startsWith(prefix)) {
            out = latin;
            start = prefix.length;
            break;
        }
    }
    for (let i = start; i < word.length; i++) {
        const c = word[i];
        const prev = i > 0 ? word[i - 1] : '';
        if (c === 'е') {
            // So'z boshida, unli, ъ yoki ь dan keyin — "ye".
            out += !prev || CYR_VOWELS.includes(prev) || prev === 'ъ' || prev === 'ь' ? 'ye' : 'e';
        }
        else if (c === 'ц') {
            out += prev && CYR_VOWELS.includes(prev) ? 'ts' : 's';
        }
        else if (c === 'ь') {
            // батальон → batalyon; boshqa hollarda yozilmaydi.
            if (word[i + 1] === 'о')
                out += 'y';
        }
        else if (c === 'ҳ' && prev === 'с') {
            // Исҳоқ: eski lotinda "sh" (ш) bilan adashmasligi uchun tutuq qo'yiladi,
            // yangi alifboda ş alohida harf — ajratish shart emas.
            out += target === 'yangi' ? 'h' : "'h";
        }
        else {
            out += (_b = (_a = special[c]) !== null && _a !== void 0 ? _a : CYR_COMMON[c]) !== null && _b !== void 0 ? _b : c;
        }
    }
    return out;
};
exports.cyrWordToLatin = cyrWordToLatin;
/** Lug'at kaliti: barcha tutuq/oʻ belgilari bir xil "'" bo'ladi. */
const toKey = (latin) => latin.replace(APOSTROPHE_RE, "'");
exports.toKey = toKey;
const LATIN_CYR = {
    a: 'а', b: 'б', c: 'ц', d: 'д', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к',
    l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у',
    v: 'в', w: 'в', x: 'х', y: 'й', z: 'з',
};
const LATIN_DIGRAPHS = { sh: 'ш', ch: 'ч', yo: 'ё', yu: 'ю', ya: 'я', ye: 'е' };
/** Lug'at prefiksi shu nuqtada kesilsa, harf birikmasi bo'linib qoladimi. */
const splitsDigraph = (key, at) => key[at] === "'" || key[at] === '`' || key.slice(at - 1, at + 1) in LATIN_DIGRAPHS;
/**
 * Lotincha so'zni qoidalar bo'yicha kirillga o'giradi.
 * `strictTutuq` bo'lsa, "o'"/"g'" dagi "'" tutuq hisoblanadi (yangi alifbodan
 * kelgan matn: u yerda oʻ/gʻ "`" bilan belgilangan); aks holda — oʻ/gʻ.
 */
const naiveLatinToCyr = (latin, prevCyr = '', strictTutuq = false) => {
    var _a;
    let out = '';
    let prev = prevCyr;
    const push = (s) => {
        out += s;
        prev = s[s.length - 1];
    };
    for (let i = 0; i < latin.length;) {
        const c = latin[i];
        const next = latin[i + 1];
        const mark = next === '`' || (next === "'" && !strictTutuq);
        if (c === 'y' && next === 'o' && (latin[i + 2] === '`' || (latin[i + 2] === "'" && !strictTutuq))) {
            push('йў'); // yoʻq, yoʻl
            i += 3;
        }
        else if ((c === 'o' || c === 'g') && mark) {
            push(c === 'o' ? 'ў' : 'ғ');
            i += 2;
        }
        else if (c === 's' && (next === "'" || next === '`') && latin[i + 2] === 'h') {
            push('сҳ');
            i += 3;
        }
        else if (latin.slice(i, i + 2) in LATIN_DIGRAPHS) {
            push(LATIN_DIGRAPHS[latin.slice(i, i + 2)]);
            i += 2;
        }
        else if (c === 'e') {
            push(!prev || CYR_VOWELS.includes(prev) ? 'э' : 'е');
            i += 1;
        }
        else if (c === "'" || c === '`') {
            push('ъ');
            i += 1;
        }
        else {
            push((_a = LATIN_CYR[c]) !== null && _a !== void 0 ? _a : c);
            i += 1;
        }
    }
    return out;
};
exports.naiveLatinToCyr = naiveLatinToCyr;
/** Avval to'liq so'z, keyin eng uzun so'z boshi (o'zak + qo'shimchalar uchun). */
const lookupLexicon = (lexicon, key, accept) => {
    const exact = lexicon.get(key);
    if (exact !== undefined && (!accept || accept({ cyr: exact, length: key.length }))) {
        return { cyr: exact, length: key.length };
    }
    for (let n = key.length - 1; n >= exports.MIN_PREFIX; n--) {
        if (splitsDigraph(key, n))
            continue;
        const cyr = lexicon.get(key.slice(0, n));
        if (cyr !== undefined) {
            const hit = { cyr, length: n };
            if (!accept || accept(hit))
                return hit;
        }
    }
    return null;
};
exports.lookupLexicon = lookupLexicon;
/** Amaldagi lotin (ichki ko'rinish) → kirill. */
const lotinWordToCyr = (latin, lexicon, strictTutuq = false, source) => {
    const key = (0, exports.toKey)(latin);
    // Yangi alifbodan kelgan so'zda lug'at topgan variant asl yozuvga mos bo'lishi shart.
    const accept = source === undefined ? undefined : (hit) => source.startsWith((0, exports.cyrWordToLatin)(hit.cyr, 'yangi'));
    const hit = (0, exports.lookupLexicon)(lexicon, key, accept);
    if (!hit)
        return (0, exports.naiveLatinToCyr)(latin, '', strictTutuq);
    return hit.cyr + (0, exports.naiveLatinToCyr)(latin.slice(hit.length), hit.cyr[hit.cyr.length - 1], strictTutuq);
};
exports.lotinWordToCyr = lotinWordToCyr;
/** Amaldagi lotin → yangi alifbo, faqat qoidalar bo'yicha. */
const naiveLotinToYangi = (latin) => {
    let out = '';
    for (let i = 0; i < latin.length;) {
        const c = latin[i];
        const next = latin[i + 1];
        if (c === 's' && (next === "'" || next === '`') && latin[i + 2] === 'h') {
            out += 'sh'; // Is'hoq → Ishoq
            i += 3;
        }
        else if (c === 's' && next === 'h') {
            out += 'ş';
            i += 2;
        }
        else if (c === 'c' && next === 'h') {
            out += 'ç';
            i += 2;
        }
        else if ((c === 'o' || c === 'g') && (next === "'" || next === '`')) {
            out += c === 'o' ? 'ö' : 'ğ';
            i += 2;
        }
        else {
            out += c === '`' ? "'" : c;
            i += 1;
        }
    }
    return out;
};
/** Lug'atda "sh" alohida s+h, "o'"/"g'" esa tutuq bo'lgan so'zlarni ajratadi. */
const AMBIGUOUS_CYR = /сҳ|[ог]ъ/;
/** Amaldagi lotin → yangi alifbo (Ishoq, ashob kabi istisnolar lug'atdan). */
const lotinWordToYangi = (latin, lexicon) => {
    const hit = (0, exports.lookupLexicon)(lexicon, (0, exports.toKey)(latin));
    if (!hit || !AMBIGUOUS_CYR.test(hit.cyr))
        return naiveLotinToYangi(latin);
    return (0, exports.cyrWordToLatin)(hit.cyr, 'yangi') + naiveLotinToYangi(latin.slice(hit.length));
};
exports.lotinWordToYangi = lotinWordToYangi;
/** Yangi alifbo → amaldagi lotin (ichki ko'rinish). Har doim bir qiymatli. */
const yangiWordToLotin = (word) => {
    let out = '';
    for (let i = 0; i < word.length; i++) {
        const c = word[i];
        if (c === 'ş')
            out += 'sh';
        else if (c === 'ç')
            out += 'ch';
        else if (c === 'ö')
            out += 'o`';
        else if (c === 'ğ')
            out += 'g`';
        else if (c === 's' && word[i + 1] === 'h')
            out += "s'";
        else if (exports.APOSTROPHES.includes(c))
            out += "'";
        else
            out += c;
    }
    return out;
};
exports.yangiWordToLotin = yangiWordToLotin;
// --- Matn darajasi ---
const LATIN_LETTERS = 'A-Za-zÇçŞşÖöĞğ';
const LATIN_WORD_RE = new RegExp(`[${LATIN_LETTERS}]+(?:[${exports.APOSTROPHES}][${LATIN_LETTERS}]+)*(?:(?<=[oOgG])[${exports.APOSTROPHES}])?`, 'g');
const CYR_WORD_RE = /[Ѐ-ӿ]+/g;
/** Havola va elektron pochta manzillari o'zgartirilmaydi. */
const SKIP_RE = /(https?:\/\/\S+|www\.\S+|\S+@\S+\.\S+)/;
/** Asl so'zning bosh/kichik harf ko'rinishini natijaga ko'chiradi. */
const applyCase = (source, out) => {
    const letters = source.replace(APOSTROPHE_RE, '');
    if (letters.length > 1 && letters === letters.toUpperCase() && letters !== letters.toLowerCase()) {
        return out.toUpperCase();
    }
    if (letters[0] && letters[0] !== letters[0].toLowerCase())
        return out.charAt(0).toUpperCase() + out.slice(1);
    return out;
};
/** Ichki ko'rinishdagi belgilarni chiqish uchun haqiqiy belgilarga almashtiradi. */
const renderLatin = (latin, options) => options.plainApostrophe
    ? latin.replace(/[`']/g, "'")
    : latin.replace(/`/g, MODIFIER).replace(/'/g, TUTUQ);
const convertWord = (word, from, to, lexicon, options) => {
    const lower = word.toLowerCase();
    let out;
    if (from === 'kirill') {
        out = renderLatin((0, exports.cyrWordToLatin)(lower, to === 'yangi' ? 'yangi' : 'lotin'), options);
    }
    else if (from === 'lotin') {
        const latin = (0, exports.toKey)(lower);
        out = to === 'kirill' ? (0, exports.lotinWordToCyr)(latin, lexicon) : renderLatin((0, exports.lotinWordToYangi)(latin, lexicon), options);
    }
    else {
        const lotin = (0, exports.yangiWordToLotin)(lower);
        out = to === 'kirill' ? (0, exports.lotinWordToCyr)(lotin, lexicon, true, (0, exports.toKey)(lower)) : renderLatin(lotin, options);
    }
    return applyCase(word, out);
};
/** Matnni bir yozuvdan ikkinchisiga o'giradi; so'z bo'lmagan qismlar o'zgarmaydi. */
const transliterate = (text, from, to, lexicon, options = {}) => {
    if (from === to)
        return text;
    const wordRe = from === 'kirill' ? CYR_WORD_RE : LATIN_WORD_RE;
    return text
        .split(SKIP_RE)
        .map((part, i) => i % 2 === 1 ? part : part.replace(wordRe, word => convertWord(word, from, to, lexicon, options)))
        .join('');
};
exports.transliterate = transliterate;
/** `lexicon.txt` mazmunini o'qiydi: har qatorda "kalit kirillcha". */
const parseLexicon = (text) => {
    const lexicon = new Map();
    for (const line of text.split('\n')) {
        const space = line.indexOf(' ');
        if (space > 0)
            lexicon.set(line.slice(0, space), line.slice(space + 1).trim());
    }
    return lexicon;
};
exports.parseLexicon = parseLexicon;

},
"lib/translit/lexicon.ts": function (exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLexicon = void 0;
const core_1 = __require("lib/translit/core.ts");
let request = null;
/** Istisnolar lug'atini bir marta yuklaydi (~27 KB, gzip). Xatolikda keyingi chaqiruv qayta urinadi. */
const loadLexicon = () => {
    request !== null && request !== void 0 ? request : (request = fetch('/translit/lexicon.txt')
        .then(response => {
        if (!response.ok)
            throw new Error(`Lug'at yuklanmadi (${response.status})`);
        return response.text();
    })
        .then(core_1.parseLexicon)
        .catch(error => {
        request = null;
        throw error;
    }));
    return request;
};
exports.loadLexicon = loadLexicon;

},
"lib/app/typing/result.ts": function (exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typingResultFromEngine = exports.isTrustedTypingResult = void 0;
/** Natija rekord va reyting uchun hisobga olinadimi. */
const isTrustedTypingResult = (result) => !result.flags || result.flags.length === 0;
exports.isTrustedTypingResult = isTrustedTypingResult;
const typingResultFromEngine = (engine) => {
    var _a;
    const elapsed = (_a = engine.finishedAt) !== null && _a !== void 0 ? _a : 0;
    const { wpm, raw, accuracy, consistency, correctChars, incorrectChars, extraChars, missedChars } = engine.stats(elapsed);
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        config: engine.config,
        wpm,
        raw,
        accuracy,
        consistency,
        correctChars,
        incorrectChars,
        extraChars,
        missedChars,
        seconds: elapsed / 1000,
        samples: [...engine.samples],
    };
};
exports.typingResultFromEngine = typingResultFromEngine;

},
"lib/app/typing/config.ts": function (exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTypingConfig = exports.isSameTypingConfig = exports.typingAlphabetLabel = exports.typingConfigLabel = exports.effectiveTypingConfig = exports.hasTypingExtras = exports.withTypingMode = exports.typingOptions = exports.sentenceOptions = exports.wordOptions = exports.timeOptions = exports.typingAlphabets = exports.defaultTypingConfig = void 0;
exports.defaultTypingConfig = {
    mode: 'time',
    amount: 30,
    punctuation: false,
    numbers: false,
    alphabet: 'lotin',
};
exports.typingAlphabets = [
    { value: 'lotin', label: 'eski' },
    { value: 'yangi', label: 'yangi' },
    { value: 'kirill', label: 'kirill' },
];
exports.timeOptions = [15, 30, 60, 120];
exports.wordOptions = [10, 25, 50, 100];
exports.sentenceOptions = [3, 5, 10, 20];
const modeOptions = { time: exports.timeOptions, words: exports.wordOptions, sentences: exports.sentenceOptions };
const defaultAmounts = { time: 30, words: 25, sentences: 5 };
const typingOptions = (config) => modeOptions[config.mode];
exports.typingOptions = typingOptions;
/** Rejim almashganda miqdor yangi rejimning standart qiymatiga o'tadi. */
const withTypingMode = (config, mode) => mode === config.mode ? config : Object.assign(Object.assign({}, config), { mode, amount: defaultAmounts[mode] });
exports.withTypingMode = withTypingMode;
/**
 * Gaplarda tinish belgilari va raqamlar o'zi bor, shuning uchun bu rejimda
 * qo'shimchalar hisobga olinmaydi (sozlamada esa boshqa rejimlar uchun saqlanadi).
 */
const hasTypingExtras = (config) => config.mode !== 'sentences';
exports.hasTypingExtras = hasTypingExtras;
/** Mashqda haqiqatda ishlatiladigan sozlama. */
const effectiveTypingConfig = (config) => (0, exports.hasTypingExtras)(config) ? config : Object.assign(Object.assign({}, config), { punctuation: false, numbers: false });
exports.effectiveTypingConfig = effectiveTypingConfig;
const typingConfigLabel = (config) => `${config.amount} ${{ time: 'soniya', words: 'söz', sentences: 'gap' }[config.mode]}`;
exports.typingConfigLabel = typingConfigLabel;
const alphabetLabels = { lotin: 'eski lotin', yangi: 'yangi lotin', kirill: 'kirill' };
const typingAlphabetLabel = (config) => alphabetLabels[config.alphabet];
exports.typingAlphabetLabel = typingAlphabetLabel;
const isSameTypingConfig = (a, b) => a.mode === b.mode &&
    a.amount === b.amount &&
    a.punctuation === b.punctuation &&
    a.numbers === b.numbers &&
    a.alphabet === b.alphabet;
exports.isSameTypingConfig = isSameTypingConfig;
/** Saqlangan (ishonchsiz) qiymatdan sozlamani tiklaydi. */
const parseTypingConfig = (raw) => {
    const json = (raw !== null && raw !== void 0 ? raw : {});
    return {
        mode: json.mode === 'words' || json.mode === 'sentences' ? json.mode : 'time',
        amount: typeof json.amount === 'number' ? json.amount : 30,
        punctuation: json.punctuation === true,
        numbers: json.numbers === true,
        alphabet: json.alphabet === 'yangi' || json.alphabet === 'kirill' ? json.alphabet : 'lotin',
    };
};
exports.parseTypingConfig = parseTypingConfig;

},
};
const __cache = {};
function __require(id) {
    if (!__cache[id]) {
        __cache[id] = {};
        __modules[id](__cache[id]);
    }
    return __cache[id];
}
module.exports = Object.assign({}, __require("lib/app/typing/replay.ts"), __require("lib/app/typing/guard.ts"), __require("lib/app/typing/words.ts"), __require("lib/app/typing/result.ts"), __require("lib/app/typing/config.ts"), __require("lib/app/typing/text.ts"), __require("lib/app/typing/engine.ts"), __require("lib/app/typing/input.ts"), __require("lib/translit/core.ts"));
