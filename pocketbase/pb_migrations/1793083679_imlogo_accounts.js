/// <reference path="../pb_data/types.d.ts" />

/**
 * Imlo Go hisoblari: tez yozish va diktant natijalari, reytinglar (view) va
 * murojaatlar. PocketBase v0.23+ uchun. `pb_migrations/` papkasiga qo'yib,
 * serverni qayta ishga tushiring.
 */

/** Reyting davrlari: hamma vaqt, joriy hafta va o'tgan hafta (dushanbadan, Toshkent vaqti — UTC+5). */
const WEEK_START = "strftime('%Y-%m-%d %H:%M:%fZ', 'now', '+5 hours', 'weekday 0', '-6 days', 'start of day', '-5 hours')";
const PREV_WEEK_START =
    "strftime('%Y-%m-%d %H:%M:%fZ', 'now', '+5 hours', 'weekday 0', '-13 days', 'start of day', '-5 hours')";
const periods = {
    '': () => '',
    _week: column => `WHERE ${column} >= ${WEEK_START}`,
    _prev_week: column => `WHERE ${column} >= ${PREV_WEEK_START} AND ${column} < ${WEEK_START}`,
};

const typingLeaderboard = where => `
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
    ${where}
    GROUP BY u.id`;

const dictationLeaderboard = where => `
    SELECT
        u.id AS id,
        u.name AS name,
        CAST(COUNT(d.id) AS INTEGER) AS dictations,
        CAST(SUM(d.ball) AS REAL) AS total_ball,
        CAST(AVG(d.ball) AS REAL) AS avg_ball,
        CAST(AVG(d.baho) AS REAL) AS avg_baho
    FROM users u
    JOIN dictation_works d ON d.user = u.id
    ${where}
    GROUP BY u.id`;

const VIEWS = [];
for (const [suffix, where] of Object.entries(periods)) {
    VIEWS.push(['typing_leaderboard' + suffix, typingLeaderboard(where('t.created'))]);
    // Diktant qayta topshirilsa, natija yangilanadi — hafta oxirgi urinish sanasi bo'yicha.
    VIEWS.push(['dictation_leaderboard' + suffix, dictationLeaderboard(where('d.updated'))]);
}

migrate(
    app => {
        const users = app.findCollectionByNameOrId('users');
        const owner = { name: 'user', type: 'relation', required: true, collectionId: users.id, cascadeDelete: true, maxSelect: 1 };
        const autodates = [
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ];
        const count = name => ({ name, type: 'number', onlyInt: true, min: 0, max: 100000 });

        // Har bir foydalanuvchi faqat o'z natijalarini ko'radi va qo'shadi.
        app.save(
            new Collection({
                type: 'base',
                name: 'typing_results',
                listRule: 'user = @request.auth.id',
                viewRule: 'user = @request.auth.id',
                createRule: "@request.auth.id != '' && user = @request.auth.id",
                updateRule: null,
                deleteRule: 'user = @request.auth.id',
                fields: [
                    owner,
                    // Brauzerdagi natija identifikatori — qayta yuklanganda takrorlanmasligi uchun.
                    { name: 'local_id', type: 'text', max: 64 },
                    { name: 'mode', type: 'select', required: true, maxSelect: 1, values: ['time', 'words'] },
                    { name: 'amount', type: 'number', required: true, onlyInt: true, min: 1, max: 1000 },
                    { name: 'punctuation', type: 'bool' },
                    { name: 'numbers', type: 'bool' },
                    { name: 'alphabet', type: 'select', maxSelect: 1, values: ['lotin', 'yangi', 'kirill'] },
                    { name: 'wpm', type: 'number', min: 0, max: 300 },
                    { name: 'raw', type: 'number', min: 0, max: 400 },
                    { name: 'accuracy', type: 'number', min: 0, max: 100 },
                    { name: 'consistency', type: 'number', min: 0, max: 100 },
                    count('correct_chars'),
                    count('incorrect_chars'),
                    count('extra_chars'),
                    count('missed_chars'),
                    { name: 'seconds', type: 'number', min: 0, max: 3600 },
                    { name: 'samples', type: 'json', maxSize: 50000 },
                    ...autodates,
                ],
                indexes: [
                    "CREATE UNIQUE INDEX `idx_typing_results_user_local` ON `typing_results` (`user`, `local_id`) WHERE `local_id` != ''",
                    'CREATE INDEX `idx_typing_results_created` ON `typing_results` (`created`)',
                ],
            })
        );

        // Diktant natijalari: har bir diktant bo'yicha bitta (oxirgi) natija.
        app.save(
            new Collection({
                type: 'base',
                name: 'dictation_works',
                listRule: 'user = @request.auth.id',
                viewRule: 'user = @request.auth.id',
                createRule: "@request.auth.id != '' && user = @request.auth.id",
                updateRule: 'user = @request.auth.id && (@request.body.user:isset = false || @request.body.user = @request.auth.id)',
                deleteRule: 'user = @request.auth.id',
                fields: [
                    owner,
                    { name: 'dictation_id', type: 'text', required: true, max: 64 },
                    { name: 'ball', type: 'number', min: 0, max: 100 },
                    { name: 'baho', type: 'number', onlyInt: true, min: 0, max: 5 },
                    { name: 'worktime', type: 'number', min: 0, max: 36000 },
                    // To'liq natija (xatolar ro'yxati, matn) — "Natija" sahifasi uchun.
                    { name: 'work', type: 'json', required: true, maxSize: 300000 },
                    ...autodates,
                ],
                indexes: [
                    'CREATE UNIQUE INDEX `idx_dictation_works_user_dictation` ON `dictation_works` (`user`, `dictation_id`)',
                    'CREATE INDEX `idx_dictation_works_updated` ON `dictation_works` (`updated`)',
                ],
            })
        );

        // Reytinglar: hamma ko'ra oladi, faqat ism va ko'rsatkichlar (email chiqmaydi).
        for (const [name, viewQuery] of VIEWS) {
            app.save(new Collection({ type: 'view', name, listRule: '', viewRule: '', viewQuery }));
        }

        // Murojaatlar: faqat kirgan foydalanuvchi yuboradi, faqat admin o'qiydi.
        app.save(
            new Collection({
                type: 'base',
                name: 'feedback',
                listRule: null,
                viewRule: null,
                createRule: "@request.auth.id != '' && user = @request.auth.id && @request.body.status:isset = false",
                updateRule: null,
                deleteRule: null,
                fields: [
                    // Hisob o'chirilsa ham murojaat saqlanib qoladi.
                    { ...owner, required: false, cascadeDelete: false },
                    { name: 'kind', type: 'select', required: true, maxSelect: 1, values: ['xatolik', 'taklif', 'savol', 'boshqa'] },
                    { name: 'message', type: 'text', required: true, max: 2000 },
                    { name: 'page', type: 'text', max: 300 },
                    // Admin uchun: murojaat holati.
                    { name: 'status', type: 'select', maxSelect: 1, values: ['yangi', 'korildi', 'hal_qilindi'] },
                    ...autodates,
                ],
            })
        );
    },
    app => {
        const names = ['feedback', ...VIEWS.map(([name]) => name).reverse(), 'dictation_works', 'typing_results'];
        for (const name of names) app.delete(app.findCollectionByNameOrId(name));
    }
);
