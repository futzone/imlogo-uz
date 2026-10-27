/**
 * Reyting yaxlitligi: tez yozish natijasini mantiqiy tekshirish va diktantni
 * serverda qayta baholash. Hooklar va migratsiya `require()` orqali ishlatadi
 * (fayl `.pb.js` emas — PocketBase uni o'zi yuklamaydi).
 */

/** Inson uchun real chegara: bundan tez natija qabul qilinmaydi. */
const MAX_WPM = 250;
/** Diktantda yozilgan matnning eng katta uzunligi (asl matndan bir necha barobar ko'p bo'lmaydi). */
const MAX_INPUT_LENGTH = 20000;

const isFiniteNumber = value => typeof value === 'number' && isFinite(value);

/**
 * Tez yozish natijasi brauzerdagi dvigatel (`src/lib/app/typing/engine.ts`)
 * hisoblagan qiymatlarga mos kelishini tekshiradi. Xato bo'lsa — sababi,
 * aks holda `null`.
 *
 * `input`: { mode, amount, wpm, raw, accuracy, correct, incorrect, extra, missed, seconds, samples }
 */
const checkTyping = input => {
    const { mode, amount, wpm, raw, accuracy, correct, incorrect, extra, missed, seconds, samples } = input;

    for (const value of [amount, wpm, raw, accuracy, correct, incorrect, extra, missed, seconds]) {
        if (!isFiniteNumber(value) || value < 0) return 'Natija noto‘g‘ri.';
    }
    if (seconds < 3) return 'Mashq juda qisqa.';
    if (wpm > MAX_WPM) return 'Natija noto‘g‘ri.';

    // Mashq davomiyligi sozlamaga mos bo'lishi kerak: vaqt rejimida aynan
    // `amount` soniya, so'zlar rejimida `amount` ta so'z, gaplar rejimida
    // `amount` ta gap (to'plamda bo'sh joysiz 21–82 belgi; sh → ş, ш kabi harflar qisqartiradi) terilgan.
    const targetChars = correct + incorrect + missed;
    if (mode === 'time') {
        if (Math.abs(seconds - amount) > 1) return 'Natija noto‘g‘ri.';
    } else if (mode === 'words') {
        if (targetChars < amount || targetChars > amount * 40) return 'Natija noto‘g‘ri.';
    } else if (mode === 'sentences') {
        if (amount > 50 || targetChars < amount * 12 || targetChars > amount * 120) return 'Natija noto‘g‘ri.';
    } else {
        return 'Natija noto‘g‘ri.';
    }

    const minutes = seconds / 60;
    // Klavish bosishlar soni (raw = bosishlar / 5 / daqiqa) va WPM belgilari.
    const keys = raw * 5 * minutes;
    const wpmChars = wpm * 5 * minutes;
    const typedChars = correct + incorrect + extra;

    // WPM faqat to'g'ri so'zlardan (bo'shliqlar bilan) hisoblanadi: u bosishlardan
    // ham, to'g'ri belgilar + bo'shliqlardan ham oshmaydi.
    if (wpmChars > keys + 2) return 'Natija noto‘g‘ri.';
    if (wpmChars > correct * 1.5 + 5) return 'Natija noto‘g‘ri.';
    // Har bir yakuniy belgi kamida bir marta bosilgan.
    if (keys + 2 < typedChars) return 'Natija noto‘g‘ri.';
    // Aniqlik — to'g'ri bosishlar ulushi. Yakuniy xato va ortiqcha belgilarning
    // har biri kamida bitta xato bosish, shuning uchun aniqlik bundan yuqori bo'lmaydi.
    if (keys > 0) {
        const maxAccuracy = ((keys - incorrect - extra) / keys) * 100;
        if (accuracy > maxAccuracy + 1) return 'Natija noto‘g‘ri.';
    } else if (accuracy > 0) {
        return 'Natija noto‘g‘ri.';
    }

    // Grafik kesimlari: taxminan har soniyada bittadan, `raw` = shu soniyadagi bosishlar × 12.
    if (!Array.isArray(samples)) return 'Natija noto‘g‘ri.';
    if (samples.length > seconds + 1 || samples.length < seconds / 2 - 2) return 'Natija noto‘g‘ri.';
    let sampledKeys = 0;
    for (const sample of samples) {
        const sampleRaw = Array.isArray(sample) ? sample[2] : null;
        if (!isFiniteNumber(sampleRaw) || sampleRaw < 0) return 'Natija noto‘g‘ri.';
        sampledKeys += sampleRaw / 12;
    }
    // Oxirgi to'liq bo'lmagan soniyadagi bosishlar kesimga tushmaydi. Eski brauzer
    // versiyasida sahifa qotib qolsa, yakunidagi bir necha soniya ham tushmay qolardi.
    const keysPerSecond = keys / seconds;
    if (sampledKeys > keys + 2 || sampledKeys < keys - keysPerSecond * 10 - 10) return 'Natija noto‘g‘ri.';

    return null;
};

/**
 * Diktantni serverdagi asl matn bo'yicha baholaydi — brauzer yuborgan ball
 * va baho hisobga olinmaydi.
 */
const scoreDictation = (evaluatorModule, originalText, userText) => {
    const evaluator = new evaluatorModule.DiktantEvaluator(originalText, userText);
    evaluator.analyze();
    return {
        ball: evaluator.evaluate100PointScale(),
        baho: evaluator.evaluate5PointScale(),
        errors: evaluator.errors,
        imloErrorCount: evaluator.imloErrorCount,
        punktuatsionErrorCount: evaluator.punktuatsionErrorCount,
        uslubiyErrorCount: evaluator.uslubiyErrorCount,
        grafikErrorCount: evaluator.grafikErrorCount,
    };
};

/**
 * `dictation_works` yaratish/yangilash so'rovi uchun: `work.input`
 * (foydalanuvchi matni) serverdagi asl matn bilan saytdagi bir xil algoritm
 * (`evaluator.js`) orqali baholanadi. Mavjud bo'lmagan diktant uchun natija
 * qabul qilinmaydi.
 */
const rescoreDictationWork = e => {
    const evaluatorModule = require(`${__hooks}/lib/evaluator.js`);
    const record = e.record;

    let dictation;
    try {
        dictation = $app.findRecordById('dictations', record.getString('dictation_id'));
    } catch (_) {
        throw new BadRequestError('Diktant topilmadi.');
    }

    let work;
    try {
        work = JSON.parse(record.getString('work') || 'null');
    } catch (_) {
        work = null;
    }
    if (!work || typeof work !== 'object' || Array.isArray(work)) throw new BadRequestError('Natija noto‘g‘ri.');
    const input = typeof work.input === 'string' ? work.input : '';
    if (input.length > MAX_INPUT_LENGTH) throw new BadRequestError('Natija noto‘g‘ri.');

    const score = scoreDictation(evaluatorModule, dictation.getString('text'), input);
    // Ajratilgan vaqtdan ortiq bo'lishi mumkin emas.
    const worktime = Math.min(Math.max(record.getFloat('worktime'), 0), dictation.getFloat('time') * 60);

    record.set('ball', score.ball);
    record.set('baho', score.baho);
    record.set('worktime', worktime);
    // "Natija" sahifasi `work` dan o'qiydi — u ham server bahosini ko'rsatadi.
    record.set('work', Object.assign(work, score, { id: dictation.id, input, worktime }));

    e.next();
};

module.exports = { MAX_WPM, MAX_INPUT_LENGTH, checkTyping, scoreDictation, rescoreDictationWork };
