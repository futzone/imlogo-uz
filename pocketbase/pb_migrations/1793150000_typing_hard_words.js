/// <reference path="../pb_data/types.d.ts" />

/**
 * "Qiyin so'zlar" — tez yozishda eng ko'p odam xato qiladigan so'zlar:
 *
 * - `typing_word_stats` — foydalanuvchi × so'z: necha marta terilgan va
 *   nechtasida xato bosilgan (tuzatilgan bo'lsa ham). Uni faqat server
 *   (`pb_hooks/lib/word_stats.js`) reytingga kirgan mashqlardan yozadi.
 * - `typing_hard_words` — hamma uchun ochiq yig'indi.
 * - Diktant xatolari ro'yxati (`mistake_words`) o'rniga keladi.
 * - Oxirgi 30 kundagi mashqlar (log saqlangan) bo'yicha boshlang'ich to'ldirish.
 */

const HARD_WORDS = `
    SELECT
        LOWER(HEX(s.word)) AS id,
        CAST(s.word AS TEXT) AS word,
        CAST(SUM(CASE WHEN s.mistakes > 0 THEN 1 ELSE 0 END) AS INTEGER) AS users,
        CAST(COUNT(*) AS INTEGER) AS typists,
        CAST(SUM(s.attempts) AS INTEGER) AS attempts,
        CAST(SUM(s.mistakes) AS INTEGER) AS mistakes,
        CAST(ROUND(SUM(s.mistakes) * 100.0 / SUM(s.attempts), 1) AS REAL) AS error_rate
    FROM typing_word_stats s
    GROUP BY s.word
    HAVING SUM(s.mistakes) > 0`;

// Qaytarishda tiklanadi (1793130000_public_profiles.js dagi bilan bir xil).
const MISTAKE_WORDS = `
    SELECT
        LOWER(HEX(m.word)) AS id,
        CAST(m.word AS TEXT) AS word,
        CAST(COUNT(*) AS INTEGER) AS mistakes,
        CAST(COUNT(DISTINCT m.user) AS INTEGER) AS users,
        CAST(m.variant AS TEXT) AS variant,
        CAST(MAX(m.variant_count) AS INTEGER) AS variant_count
    FROM (
        SELECT
            e.user AS user,
            e.word AS word,
            e.variant AS variant,
            COUNT(*) OVER (PARTITION BY e.word, e.variant) AS variant_count
        FROM (
            SELECT
                d.user AS user,
                LOWER(TRIM(json_extract(x.value, '$.originalFragment'))) AS word,
                LOWER(TRIM(json_extract(x.value, '$.userFragment'))) AS variant
            FROM dictation_works d
            JOIN dictations dc ON dc.id = d.dictation_id
            JOIN json_each(d.work, '$.errors') x
            WHERE json_extract(x.value, '$.type') IN ('IMLO', 'GRAFIK', 'USLUBIY')
        ) e
        WHERE e.word != '' AND e.variant != '' AND e.word != e.variant AND INSTR(e.word, ' ') = 0
    ) m
    GROUP BY m.word`;

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
        const users = app.findCollectionByNameOrId('users');
        app.save(
            new Collection({
                type: 'base',
                name: 'typing_word_stats',
                listRule: null,
                viewRule: null,
                createRule: null,
                updateRule: null,
                deleteRule: null,
                fields: [
                    { name: 'user', type: 'relation', required: true, collectionId: users.id, cascadeDelete: true, maxSelect: 1 },
                    { name: 'word', type: 'text', required: true, max: 64 },
                    { name: 'attempts', type: 'number', onlyInt: true, min: 0 },
                    { name: 'mistakes', type: 'number', onlyInt: true, min: 0 },
                    { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
                    { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
                ],
                indexes: [
                    'CREATE UNIQUE INDEX `idx_typing_word_stats_user_word` ON `typing_word_stats` (`user`, `word`)',
                    'CREATE INDEX `idx_typing_word_stats_word` ON `typing_word_stats` (`word`)',
                ],
            })
        );
        app.save(new Collection({ type: 'view', name: 'typing_hard_words', listRule: '', viewRule: '', viewQuery: HARD_WORDS }));
        app.delete(app.findCollectionByNameOrId('mistake_words'));

        // Boshlang'ich to'ldirish: logi saqlangan, reytingga kirgan mashqlar.
        const T = loadLib('typing');
        const stats = loadLib('word_stats');
        if (!T || !stats || typeof T.typingWordAttempts !== 'function') return;
        const rows = arrayOf(new DynamicModel({ test: '', result: '' }));
        app.db()
            .newQuery(
                "SELECT t.id AS test, r.id AS result FROM typing_tests t JOIN typing_results r ON r.id = t.result " +
                    "WHERE t.used = TRUE AND r.ranked = TRUE AND t.log != '' AND t.log != 'null'"
            )
            .all(rows);
        for (const row of rows) {
            try {
                const test = app.findRecordById('typing_tests', row.test);
                const config = {
                    mode: test.getString('mode'),
                    amount: test.getInt('amount'),
                    punctuation: test.getBool('punctuation'),
                    numbers: test.getBool('numbers'),
                    alphabet: test.getString('alphabet'),
                };
                const words = parseJson(test.getString('words'));
                const log = parseJson(test.getString('log'));
                if (!Array.isArray(words) || !Array.isArray(log)) continue;
                const replay = T.replayTypingLog(config, words, log);
                stats.record(app, test.getString('user'), T.typingWordAttempts(replay.engine));
            } catch (_) {
                // Buzilgan yozuv tashlab ketiladi.
            }
        }
    },
    app => {
        app.save(new Collection({ type: 'view', name: 'mistake_words', listRule: '', viewRule: '', viewQuery: MISTAKE_WORDS }));
        app.delete(app.findCollectionByNameOrId('typing_hard_words'));
        app.delete(app.findCollectionByNameOrId('typing_word_stats'));
    }
);
