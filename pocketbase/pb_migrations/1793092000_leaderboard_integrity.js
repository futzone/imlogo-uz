/// <reference path="../pb_data/types.d.ts" />

/**
 * Reytingni soxta natijalardan himoyalash:
 *
 * - `typing_results.ranked` — natija reytingga kiradimi. Uni faqat server
 *   (`pb_hooks/typing_results.pb.js`) belgilaydi, so'rovda yuborib bo'lmaydi.
 * - `local_id` majburiy — bir natijani bo'sh `local_id` bilan qayta-qayta
 *   yuborib bo'lmaydi (unikal indeks doim ishlaydi).
 * - Reyting view'lari: tez yozishda faqat `ranked` natijalar, diktantda faqat
 *   mavjud diktantlar bo'yicha natijalar hisoblanadi.
 * - Mavjud natijalar yangi qoidalar bo'yicha qayta tekshiriladi: tez yozishda
 *   mos kelmaganlari reytingdan chiqariladi, diktantlar qayta baholanadi.
 */

const WEEK_START = "strftime('%Y-%m-%d %H:%M:%fZ', 'now', '+5 hours', 'weekday 0', '-6 days', 'start of day', '-5 hours')";
const PREV_WEEK_START =
    "strftime('%Y-%m-%d %H:%M:%fZ', 'now', '+5 hours', 'weekday 0', '-13 days', 'start of day', '-5 hours')";
const periods = {
    '': () => '',
    _week: column => `AND ${column} >= ${WEEK_START}`,
    _prev_week: column => `AND ${column} >= ${PREV_WEEK_START} AND ${column} < ${WEEK_START}`,
};

const typingLeaderboard = (where, rankedOnly) => `
    SELECT
        u.id AS id,
        u.name AS name,
        CAST(COALESCE(MAX(CASE WHEN t.accuracy >= 75 THEN t.wpm END), 0) AS REAL) AS best_wpm,
        CAST(AVG(t.wpm) AS REAL) AS avg_wpm,
        CAST(AVG(t.accuracy) AS REAL) AS avg_accuracy,
        CAST(COUNT(t.id) AS INTEGER) AS games,
        CAST(SUM(t.seconds) AS REAL) AS total_seconds
    FROM users u
    JOIN typing_results t ON t.user = u.id
    WHERE ${rankedOnly ? 't.ranked = TRUE' : '1 = 1'} ${where}
    GROUP BY u.id`;

const dictationLeaderboard = (where, existingOnly) => `
    SELECT
        u.id AS id,
        u.name AS name,
        CAST(COUNT(d.id) AS INTEGER) AS dictations,
        CAST(SUM(d.ball) AS REAL) AS total_ball,
        CAST(AVG(d.ball) AS REAL) AS avg_ball,
        CAST(AVG(d.baho) AS REAL) AS avg_baho
    FROM users u
    JOIN dictation_works d ON d.user = u.id
    ${existingOnly ? 'JOIN dictations x ON x.id = d.dictation_id' : ''}
    WHERE 1 = 1 ${where}
    GROUP BY u.id`;

const views = secure => {
    const result = [];
    for (const [suffix, where] of Object.entries(periods)) {
        result.push(['typing_leaderboard' + suffix, typingLeaderboard(where('t.created'), secure)]);
        result.push(['dictation_leaderboard' + suffix, dictationLeaderboard(where('d.updated'), secure)]);
    }
    return result;
};

const OWNER_CREATE = "@request.auth.id != '' && user = @request.auth.id";

/** Hooklar kutubxonasi: migratsiya ham server bilan bir xil tekshiruvdan foydalanadi. */
const loadLib = name => {
    try {
        return require(`${__hooks}/lib/${name}.js`);
    } catch (_) {
        return null;
    }
};

const parseJson = value => {
    try {
        return JSON.parse(value || 'null');
    } catch (_) {
        return null;
    }
};

migrate(
    app => {
        const typing = app.findCollectionByNameOrId('typing_results');
        typing.fields.add(new BoolField({ name: 'ranked' }));
        typing.fields.getByName('local_id').required = true;
        typing.createRule = `${OWNER_CREATE} && @request.body.ranked:isset = false`;
        app.save(typing);

        for (const [name, viewQuery] of views(true)) {
            const view = app.findCollectionByNameOrId(name);
            view.viewQuery = viewQuery;
            app.save(view);
        }

        const integrity = loadLib('integrity');
        const evaluator = loadLib('evaluator');

        // Mavjud tez yozish natijalari: tekshiruvdan o'tganlari reytingda qoladi
        // (kutubxona yuklanmasa, hammasi qoladi — reyting bo'shab qolmasin).
        for (const record of app.findAllRecords('typing_results')) {
            const ranked =
                !integrity ||
                integrity.checkTyping({
                    mode: record.getString('mode'),
                    amount: record.getInt('amount'),
                    wpm: record.getFloat('wpm'),
                    raw: record.getFloat('raw'),
                    accuracy: record.getFloat('accuracy'),
                    correct: record.getInt('correct_chars'),
                    incorrect: record.getInt('incorrect_chars'),
                    extra: record.getInt('extra_chars'),
                    missed: record.getInt('missed_chars'),
                    seconds: record.getFloat('seconds'),
                    samples: parseJson(record.getString('samples')),
                }) === null;
            record.set('ranked', ranked);
            app.saveNoValidate(record);
        }

        // Mavjud diktant natijalari serverdagi asl matn bo'yicha qayta baholanadi.
        if (integrity && evaluator) {
            for (const record of app.findAllRecords('dictation_works')) {
                let dictation;
                try {
                    dictation = app.findRecordById('dictations', record.getString('dictation_id'));
                } catch (_) {
                    continue; // Mavjud bo'lmagan diktant — view'da hisoblanmaydi.
                }
                const work = parseJson(record.getString('work'));
                const input = work && typeof work.input === 'string' ? work.input : '';
                const score = integrity.scoreDictation(evaluator, dictation.getString('text'), input);
                const newWork = work && typeof work === 'object' ? Object.assign(work, score) : work;
                // To'g'ridan-to'g'ri SQL: `updated` o'zgarmasin — haftalik reyting oxirgi urinish sanasi bo'yicha.
                app.db()
                    .newQuery('UPDATE dictation_works SET ball = {:ball}, baho = {:baho}, work = {:work} WHERE id = {:id}')
                    .bind({ ball: score.ball, baho: score.baho, work: JSON.stringify(newWork), id: record.id })
                    .execute();
            }
        }
    },
    app => {
        for (const [name, viewQuery] of views(false)) {
            const view = app.findCollectionByNameOrId(name);
            view.viewQuery = viewQuery;
            app.save(view);
        }

        const typing = app.findCollectionByNameOrId('typing_results');
        typing.fields.removeByName('ranked');
        typing.fields.getByName('local_id').required = false;
        typing.createRule = OWNER_CREATE;
        app.save(typing);
    }
);
