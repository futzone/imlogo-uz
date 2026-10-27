/**
 * Server tekshiradigan tez yozish mashqi (`typing_api.pb.js` marshrutlari):
 *
 * 1. `start` — so'zlarni server tanlaydi va mashqni (`typing_tests`) yozib qo'yadi.
 * 2. `submit` — brauzer faqat bosishlar logini yuboradi; server uni shu so'zlar
 *    ustida qayta o'ynab, WPM, aniqlik va barqarorlikni o'zi hisoblaydi
 *    (saytdagi bilan bir xil kod: `lib/typing.js`), evristikalar va server
 *    vaqti bo'yicha tekshiradi. Har bir mashq faqat bir marta yuboriladi.
 *
 * Shubhali natija `flagged = true` bilan saqlanadi va reytingga kirmaydi.
 */

const LIMITS = {
    /** Bir daqiqada boshlash mumkin bo'lgan mashqlar (Tab bilan qayta boshlash ham hisob). */
    startsPerMinute: 30,
    /** Bir daqiqada yuborish mumkin bo'lgan natijalar. */
    submitsPerMinute: 10,
    /** Mashq shu vaqt ichida yuborilmasa, eskiradi. */
    testTtlMs: 45 * 60 * 1000,
    /** Server vaqti va mashq davomiyligi orasidagi ruxsat etilgan farq (tarmoq kechikishi). */
    serverTimeToleranceMs: 1500,
    maxLogEntries: 8000,
    maxValueLength: 64,
};

const MODES = ['time', 'words', 'sentences'];
const ALPHABETS = ['lotin', 'yangi', 'kirill'];

const typing = () => require(`${__hooks}/lib/typing.js`);

// Modul har bir JS muhitida bir marta yuklanadi — so'zlar to'plami keshlanadi.
const cache = {};
const readData = name => toString($os.readFile(`${__hooks}/lib/data/${name}`));
const lexicon = () => cache.lexicon || (cache.lexicon = typing().parseLexicon(readData('lexicon.txt')));
const latinWords = () => cache.words || (cache.words = typing().parseWordList(readData('uz.txt')));
const latinSentences = () =>
    cache.sentences || (cache.sentences = typing().parseSentenceList(readData('uz-sentences.txt')));

const wordPool = alphabet => {
    const key = `words:${alphabet}`;
    if (!cache[key]) {
        const T = typing();
        cache[key] =
            alphabet === 'lotin' ? latinWords() : latinWords().map(word => T.transliterate(word, 'lotin', alphabet, lexicon()));
    }
    return cache[key];
};

/** Mashq so'zlari: brauzerdagi generatorning o'zi (`createWordGenerator`, `createSentenceWords`). */
const generateWords = config => {
    const T = typing();
    if (config.mode === 'sentences') {
        // Butun to'plam emas, faqat tasodifiy tanlangan gaplar o'giriladi.
        const all = latinSentences();
        const picked = [];
        const used = {};
        while (picked.length < Math.min(all.length, config.amount * 4)) {
            const index = Math.floor(Math.random() * all.length);
            if (used[index]) continue;
            used[index] = true;
            picked.push(
                config.alphabet === 'lotin'
                    ? all[index]
                    : T.normalizeTypingText(T.transliterate(all[index], 'lotin', config.alphabet, lexicon()))
            );
        }
        return T.createSentenceWords(picked, config.amount);
    }
    const next = T.createWordGenerator(wordPool(config.alphabet), config);
    // Vaqt rejimida: 250 WPM dan ham ko'proq so'z + ekranda keyingi qatorlar uchun zaxira.
    const count = config.mode === 'words' ? config.amount : Math.ceil(config.amount * 5) + 60;
    const words = [];
    for (let i = 0; i < count; i++) words.push(next());
    return words;
};

const parseConfig = body => {
    const T = typing();
    const mode = body.mode;
    if (MODES.indexOf(mode) < 0) throw new BadRequestError('Rejim noto‘g‘ri.');
    const options = { time: T.timeOptions, words: T.wordOptions, sentences: T.sentenceOptions }[mode];
    if (options.indexOf(body.amount) < 0) throw new BadRequestError('Miqdor noto‘g‘ri.');
    if (ALPHABETS.indexOf(body.alphabet) < 0) throw new BadRequestError('Yozuv noto‘g‘ri.');
    return T.effectiveTypingConfig({
        mode,
        amount: body.amount,
        punctuation: body.punctuation === true,
        numbers: body.numbers === true,
        alphabet: body.alphabet,
    });
};

const pbDate = ms => new Date(ms).toISOString().replace('T', ' ');
const parsePbDate = value => new Date(value.replace(' ', 'T')).getTime();

const rateLimit = (collection, userId, limit) => {
    const recent = $app.countRecords(
        collection,
        $dbx.exp('user = {:user} AND created > {:since}', { user: userId, since: pbDate(Date.now() - 60 * 1000) })
    );
    if (recent >= limit) throw new ApiError(429, 'Juda köp urinish — bir daqiqadan keyin qayta urinib köring.');
};

const start = e => {
    const userId = e.auth.id;
    const config = parseConfig(e.requestInfo().body);
    rateLimit('typing_tests', userId, LIMITS.startsPerMinute);

    const words = generateWords(config);
    const record = new Record($app.findCollectionByNameOrId('typing_tests'));
    record.set('user', userId);
    record.set('mode', config.mode);
    record.set('amount', config.amount);
    record.set('punctuation', config.punctuation);
    record.set('numbers', config.numbers);
    record.set('alphabet', config.alphabet);
    record.set('words', words);
    record.set('used', false);
    $app.save(record);

    return e.json(200, { id: record.id, words });
};

/** Ishonchsiz logni tekshiradi; noto'g'ri bo'lsa, so'rov rad etiladi. */
const parseLog = raw => {
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > LIMITS.maxLogEntries) {
        throw new BadRequestError('Bosishlar logi noto‘g‘ri.');
    }
    const log = [];
    let previous = 0;
    for (const item of raw) {
        const entry = item || {};
        const t = entry.t;
        const valid =
            typeof t === 'number' &&
            isFinite(t) &&
            t >= previous &&
            t <= 3600 * 1000 &&
            (entry.v === null || (typeof entry.v === 'string' && entry.v.length <= LIMITS.maxValueLength)) &&
            typeof entry.it === 'string' &&
            entry.it.length <= 32 &&
            (entry.k === null || (typeof entry.k === 'string' && entry.k.length <= 16));
        if (!valid) throw new BadRequestError('Bosishlar logi noto‘g‘ri.');
        previous = t;
        log.push({ t, v: entry.v, it: entry.it, k: entry.k });
    }
    return log;
};

const round1 = value => Math.round(value * 10) / 10;

const submit = e => {
    const T = typing();
    const { checkTyping } = require(`${__hooks}/lib/integrity.js`);
    const userId = e.auth.id;
    const body = e.requestInfo().body;
    rateLimit('typing_results', userId, LIMITS.submitsPerMinute);

    let test;
    try {
        test = $app.findRecordById('typing_tests', String(body.testId || ''));
    } catch (_) {
        throw new NotFoundError('Mashq topilmadi.');
    }
    if (test.getString('user') !== userId) throw new NotFoundError('Mashq topilmadi.');

    const age = Date.now() - parsePbDate(test.getString('created'));
    if (age > LIMITS.testTtlMs) throw new BadRequestError('Mashq eskirgan.');
    const log = parseLog(body.log);

    // Bir martalik: shartli yangilash — bir vaqtda ikki so'rov kelsa ham faqat bittasi o'tadi.
    const claimed = $app
        .db()
        .newQuery('UPDATE typing_tests SET used = TRUE WHERE id = {:id} AND used = FALSE')
        .bind({ id: test.id })
        .execute()
        .rowsAffected();
    if (claimed !== 1) throw new BadRequestError('Bu mashq natijasi allaqachon yuborilgan.');

    const config = {
        mode: test.getString('mode'),
        amount: test.getInt('amount'),
        punctuation: test.getBool('punctuation'),
        numbers: test.getBool('numbers'),
        alphabet: test.getString('alphabet'),
    };
    const words = JSON.parse(test.getString('words'));
    const replay = T.replayTypingLog(config, words, log);
    if (!replay.engine.finished) throw new BadRequestError('Mashq tugallanmagan.');

    const result = T.typingResultFromEngine(replay.engine);
    const samples = result.samples.map(s => [s.second, round1(s.wpm), s.raw, s.errors]);
    const error = checkTyping({
        mode: config.mode,
        amount: config.amount,
        wpm: result.wpm,
        raw: result.raw,
        accuracy: result.accuracy,
        correct: result.correctChars,
        incorrect: result.incorrectChars,
        extra: result.extraChars,
        missed: result.missedChars,
        seconds: result.seconds,
        samples,
    });
    const flags = T.analyzeTyping(replay.events, result.wpm);
    // Server o'zi hisoblagan natija mantiqan to'g'ri bo'lishi kerak; faqat imkonsiz
    // tezlik (bot) rad etilmaydi — u bayroq bilan saqlanadi.
    if (error && flags.indexOf('wpm') < 0) throw new BadRequestError(error);
    // Server vaqti: mashq berilganidan beri uning davomiyligicha vaqt o'tgan bo'lishi kerak.
    let timeMismatch = age + LIMITS.serverTimeToleranceMs < result.seconds * 1000;
    // Bir nechta mashqni parallel boshlab, ketma-ket yuborish ham real vaqtdan tez bo'lmasin.
    const last = $app.findRecordsByFilter('typing_results', 'user = {:user} && ranked = true', '-created', 1, 0, {
        user: userId,
    });
    if (last.length > 0 && Date.now() - parsePbDate(last[0].getString('created')) < (result.seconds - 2) * 1000) {
        timeMismatch = true;
    }
    if (timeMismatch) flags.push('server_time');

    let localId = String(body.localId || '').slice(0, 64);
    const duplicate =
        localId === '' ||
        $app.countRecords('typing_results', $dbx.exp('user = {:user} AND local_id = {:id}', { user: userId, id: localId })) > 0;
    if (duplicate) localId = `${Date.now()}-${$security.randomString(6)}`;

    const record = new Record($app.findCollectionByNameOrId('typing_results'));
    record.load({
        user: userId,
        local_id: localId,
        mode: config.mode,
        amount: config.amount,
        punctuation: config.punctuation,
        numbers: config.numbers,
        alphabet: config.alphabet,
        // Maydon chegaralari (bot natijasi shundan oshishi mumkin — u baribir bayroqlangan).
        wpm: Math.min(result.wpm, 300),
        raw: Math.min(result.raw, 400),
        accuracy: result.accuracy,
        consistency: result.consistency,
        correct_chars: result.correctChars,
        incorrect_chars: result.incorrectChars,
        extra_chars: result.extraChars,
        missed_chars: result.missedChars,
        seconds: result.seconds,
        samples,
        ranked: flags.length === 0,
        flagged: flags.length > 0,
        flag_reasons: flags,
        verified: true,
    });
    $app.save(record);

    // Shubhali natijalarni keyin ko'rib chiqish uchun log mashq bilan saqlanadi.
    test.set('log', log);
    test.set('result', record.id);
    test.set('used', true);
    $app.save(test);

    return e.json(200, { record, ranked: flags.length === 0, flags });
};

/** Eski mashqlar: yuborilmaganlari 1 kundan, yuborilganlari (log bilan) 30 kundan keyin o'chiriladi. */
const cleanup = () => {
    const now = Date.now();
    $app.db()
        .newQuery('DELETE FROM typing_tests WHERE (used = FALSE AND created < {:day}) OR created < {:month}')
        .bind({ day: pbDate(now - 24 * 3600 * 1000), month: pbDate(now - 30 * 24 * 3600 * 1000) })
        .execute();
};

module.exports = { LIMITS, generateWords, parseConfig, parseLog, start, submit, cleanup };
