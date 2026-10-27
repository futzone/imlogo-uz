/**
 * Tez yozish anti-cheat testlari:  npm run typing:test
 *
 * Server ishlatadigan `pocketbase/pb_hooks/lib/typing.js` (saytdagi koddan
 * `npm run pb:lib` bilan yasalgan) tekshiriladi: odamga xos log bayroqsiz
 * o'tishi va server qayta hisoblagan natija brauzerdagi bilan aynan bir xil
 * bo'lishi, avtomatik/bir zumda kiritilgan loglar esa bayroqlanishi kerak.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = createRequire(import.meta.url)(join(root, 'pocketbase', 'pb_hooks', 'lib', 'typing.js'));

type Config = { mode: 'time' | 'words' | 'sentences'; amount: number; punctuation: boolean; numbers: boolean; alphabet: string };
type Entry = { t: number; v: string | null; it: string; k: string | null };

const WORDS = "o'zbek til imlo diktant va kitob maktab shahar bu yozuv chiroyli bahor ona vatan".split(' ');
const YANGI = 'özbek til şahar çiroyli ğalaba töğri maşq köngil bahor ona'.split(' ');

/** Takrorlanadigan tasodifiy sonlar (testlar har safar bir xil bo'lsin). */
const random = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

interface Typist {
    /** Belgilar orasidagi vaqt (ms) generatori. */
    interval: () => number;
    errorRate: number;
    keyed?: boolean;
    /** Bir hodisada shuncha belgi (nusxalash/IME kabi). */
    chunk?: number;
}

/**
 * Brauzerdagi `TypingView` ni simulyatsiya qiladi: har bir hodisani logga
 * yozib, xuddi shu `applyTypingValue` orqali dvigatelga beradi va taymerni
 * har ~100 ms da chaqiradi. Brauzer natijasi va logni qaytaradi.
 */
const simulate = (config: Config, words: string[], typist: Typist, rnd: () => number) => {
    const engine = new T.TypingEngine(config, words);
    const state = { pending: null };
    const log: Entry[] = [];
    let t = 0;
    let nextTick = 100;
    const push = (v: string | null, it: string, k: string | null) => {
        const time = Math.round(t * 10) / 10;
        log.push({ t: time, v, it, k: typist.keyed === false ? null : k });
        T.applyTypingValue(engine, state, v, time);
    };
    // Yangi alifbo harflari klaviaturada ikki belgi bilan teriladi (ş → s + h).
    const keysFor = (char: string): string[] =>
        ({ ş: ['s', 'h'], ç: ['c', 'h'], ö: ['o', "'"], ğ: ['g', "'"] } as Record<string, string[]>)[char] ?? [char];

    while (!engine.finished && t < 600000) {
        t += typist.interval();
        while (nextTick <= t && !engine.finished) {
            engine.tick(nextTick);
            nextTick += 90 + rnd() * 30;
        }
        if (engine.finished) break;
        const target: string = engine.target;
        if (target === undefined) break;
        const current: string = engine.current;
        if (current.length >= target.length) {
            if (T.isTypedWordCorrect(current, target) || rnd() < 0.5) push(current + ' ', 'insertText', ' ');
            else push(current.length ? current.slice(0, -1) : null, 'deleteContentBackward', 'Backspace');
            continue;
        }
        if (rnd() < typist.errorRate) {
            push(current + 'x', 'insertText', 'x');
            continue;
        }
        if (typist.chunk && typist.chunk > 1) {
            const chunk = target.slice(current.length, current.length + typist.chunk);
            push(current + chunk, 'insertText', null);
            continue;
        }
        const keys = config.alphabet === 'yangi' ? keysFor(target[current.length]) : [target[current.length]];
        for (let i = 0; i < keys.length; i++) {
            if (i > 0) t += typist.interval();
            push(engine.current + keys[i], 'insertText', keys[i]);
        }
    }
    if (config.mode === 'time') engine.tick(config.amount * 1000);
    return { client: T.typingResultFromEngine(engine), log };
};

/** Odamga xos: o'rtacha ~140 ms, keng tarqoq oraliqlar, vaqti-vaqti bilan to'xtash. */
const human = (rnd: () => number): Typist => ({
    interval: () => (rnd() < 0.03 ? 600 + rnd() * 900 : 60 + rnd() * rnd() * 260),
    errorRate: 0.04,
});

const stats = (r: any) => ({
    wpm: r.wpm,
    raw: r.raw,
    accuracy: r.accuracy,
    consistency: r.consistency,
    correctChars: r.correctChars,
    incorrectChars: r.incorrectChars,
    extraChars: r.extraChars,
    missedChars: r.missedChars,
    seconds: r.seconds,
    samples: r.samples,
});

let passed = 0;
const test = (name: string, body: () => void) => {
    body();
    passed++;
    console.log(`✓ ${name}`);
};

const configs: Config[] = [
    { mode: 'time', amount: 15, punctuation: false, numbers: false, alphabet: 'lotin' },
    { mode: 'time', amount: 60, punctuation: false, numbers: false, alphabet: 'lotin' },
    { mode: 'words', amount: 25, punctuation: false, numbers: false, alphabet: 'lotin' },
    { mode: 'words', amount: 10, punctuation: false, numbers: false, alphabet: 'yangi' },
    { mode: 'time', amount: 30, punctuation: false, numbers: false, alphabet: 'yangi' },
];

for (const [index, config] of configs.entries()) {
    test(`odam logi: ${config.mode} ${config.amount} (${config.alphabet}) — server natijasi brauzer bilan bir xil, bayroq yo'q`, () => {
        const rnd = random(11 + index);
        const pool = config.alphabet === 'yangi' ? YANGI : WORDS;
        const words = Array.from({ length: config.mode === 'words' ? config.amount : 400 }, () => pool[Math.floor(rnd() * pool.length)]);
        const { client, log } = simulate(config, words, human(rnd), rnd);
        const replay = T.replayTypingLog(config, words, log);
        assert.equal(replay.engine.finished, true);
        assert.deepEqual(stats(T.typingResultFromEngine(replay.engine)), stats(client));
        assert.deepEqual(T.analyzeTyping(replay.events, client.wpm), []);
    });
}

const config: Config = { mode: 'time', amount: 30, punctuation: false, numbers: false, alphabet: 'lotin' };
const words = Array.from({ length: 600 }, (_, i) => WORDS[i % WORDS.length]);
const flagsFor = (typist: Typist, seed = 5) => {
    const rnd = random(seed);
    const { client, log } = simulate(config, words, typist, rnd);
    const replay = T.replayTypingLog(config, words, log);
    return T.analyzeTyping(replay.events, T.typingResultFromEngine(replay.engine).wpm) as string[];
};

test('bir zumda kiritilgan log (belgilar orasida ~1 ms) bayroqlanadi', () => {
    const flags = flagsFor({ interval: () => 1, errorRate: 0 });
    for (const flag of ['burst', 'second_burst', 'fast_intervals', 'wpm']) assert.ok(flags.includes(flag), flag);
});

test("bir xil maromdagi script (har 70 ms) bayroqlanadi", () => {
    assert.ok(flagsFor({ interval: () => 70, errorRate: 0 }).includes('uniform_rhythm'));
});

test('bir hodisada bir nechta belgi (nusxalash) bayroqlanadi', () => {
    assert.ok(flagsFor({ interval: () => 400, errorRate: 0, chunk: 4 }).includes('multi_insert'));
});

test('klavish bosilmasdan kiritilgan matn bayroqlanadi', () => {
    const rnd = random(9);
    assert.ok(flagsFor({ ...human(rnd), keyed: false }).includes('no_keydown'));
});

test('250 WPM dan tez (tarqoq oraliqlar bilan ham) bayroqlanadi', () => {
    const rnd = random(3);
    const flags = flagsFor({ interval: () => 25 + rnd() * 30, errorRate: 0 });
    assert.ok(flags.includes('wpm'));
});

test('sekin, bir maromda bo\'lmagan odam (20 WPM) bayroqlanmaydi', () => {
    const rnd = random(21);
    assert.deepEqual(flagsFor({ interval: () => 250 + rnd() * 700, errorRate: 0.05 }), []);
});

test('evristika chegaralari sozlanadi', () => {
    const events = Array.from({ length: 30 }, (_, i) => ({ t: i * 60, added: 1, it: 'insertText', keyed: true }));
    assert.ok(T.analyzeTyping(events, 50).includes('uniform_rhythm'));
    assert.deepEqual(T.analyzeTyping(events, 50, { ...T.defaultTypingGuardConfig, minIntervalVariation: 0 }), []);
});

test("tugallanmagan so'zlar rejimi logi `finished = false` beradi", () => {
    const wordsConfig: Config = { mode: 'words', amount: 10, punctuation: false, numbers: false, alphabet: 'lotin' };
    const replay = T.replayTypingLog(wordsConfig, WORDS.slice(0, 10), [{ t: 0, v: 'o', it: 'insertText', k: 'o' }]);
    assert.equal(replay.engine.finished, false);
});

console.log(`\n${passed} ta test o'tdi`);
