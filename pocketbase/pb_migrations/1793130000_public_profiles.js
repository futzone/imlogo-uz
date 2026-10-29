/// <reference path="../pb_data/types.d.ts" />

/**
 * Ochiq profillar va hamjamiyat statistikasi:
 *
 * - `users.avatar` — foydalanuvchi o'zi yuklaydigan rasm (faqat jpeg/png/webp/gif,
 *   2 MB gacha; SVG ichida skript bo'lishi mumkinligi uchun olib tashlandi).
 * - `users.last_seen` — oxirgi faollik vaqti. Uni faqat server
 *   (`pb_hooks/profiles.pb.js`) belgilaydi, so'rovda yuborib bo'lmaydi.
 * - `profiles` — boshqa foydalanuvchining ochiq ma'lumotlari: ism, rasm,
 *   ro'yxatdan o'tgan va oxirgi faol vaqti (email chiqmaydi, ro'yxatini olib bo'lmaydi).
 * - `typing_public`, `dictation_public` — profilda ko'rinadigan natijalar
 *   (tez yozishda faqat reytingga kirganlari).
 * - Reyting view'lariga `avatar` qo'shildi.
 * - `mistake_words` — diktantlarda eng ko'p xato qilinadigan so'zlar.
 */

const WEEK_START = "strftime('%Y-%m-%d %H:%M:%fZ', 'now', '+5 hours', 'weekday 0', '-6 days', 'start of day', '-5 hours')";
const PREV_WEEK_START =
    "strftime('%Y-%m-%d %H:%M:%fZ', 'now', '+5 hours', 'weekday 0', '-13 days', 'start of day', '-5 hours')";
const periods = {
    '': () => '',
    _week: column => `AND ${column} >= ${WEEK_START}`,
    _prev_week: column => `AND ${column} >= ${PREV_WEEK_START} AND ${column} < ${WEEK_START}`,
};

// `1793092000_leaderboard_integrity.js` dagi view'lar, `withAvatar` bo'lsa — rasm bilan.
const typingLeaderboard = (where, withAvatar) => `
    SELECT
        u.id AS id,
        u.name AS name,${withAvatar ? '\n        u.avatar AS avatar,' : ''}
        CAST(COALESCE(MAX(CASE WHEN t.accuracy >= 75 THEN t.wpm END), 0) AS REAL) AS best_wpm,
        CAST(AVG(t.wpm) AS REAL) AS avg_wpm,
        CAST(AVG(t.accuracy) AS REAL) AS avg_accuracy,
        CAST(COUNT(t.id) AS INTEGER) AS games,
        CAST(SUM(t.seconds) AS REAL) AS total_seconds
    FROM users u
    JOIN typing_results t ON t.user = u.id
    WHERE t.ranked = TRUE ${where}
    GROUP BY u.id`;

const dictationLeaderboard = (where, withAvatar) => `
    SELECT
        u.id AS id,
        u.name AS name,${withAvatar ? '\n        u.avatar AS avatar,' : ''}
        CAST(COUNT(d.id) AS INTEGER) AS dictations,
        CAST(SUM(d.ball) AS REAL) AS total_ball,
        CAST(AVG(d.ball) AS REAL) AS avg_ball,
        CAST(AVG(d.baho) AS REAL) AS avg_baho
    FROM users u
    JOIN dictation_works d ON d.user = u.id
    JOIN dictations x ON x.id = d.dictation_id
    WHERE 1 = 1 ${where}
    GROUP BY u.id`;

const leaderboards = withAvatar => {
    const result = [];
    for (const [suffix, where] of Object.entries(periods)) {
        result.push(['typing_leaderboard' + suffix, typingLeaderboard(where('t.created'), withAvatar)]);
        result.push(['dictation_leaderboard' + suffix, dictationLeaderboard(where('d.updated'), withAvatar)]);
    }
    return result;
};

/**
 * Xato so'zlar: diktant natijalaridagi imloviy, grafik va uslubiy xatolardan
 * bitta so'zga tegishlilari (tushib qolgan/ortiqcha so'z va faqat bosh harf
 * xatolari hisoblanmaydi). `variant` — shu so'zning eng ko'p uchraydigan
 * noto'g'ri yozilishi. Faqat mavjud diktantlar bo'yicha.
 */
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

const PUBLIC_VIEWS = [
    {
        name: 'profiles',
        // Faqat id bo'yicha ochiladi — foydalanuvchilar ro'yxatini olib bo'lmaydi.
        listRule: null,
        viewRule: '',
        viewQuery: 'SELECT u.id AS id, u.name AS name, u.avatar AS avatar, u.created AS created, u.last_seen AS last_seen FROM users u',
    },
    {
        name: 'typing_public',
        listRule: '',
        viewRule: '',
        viewQuery: `
            SELECT t.id AS id, t.user AS user, t.mode AS mode, t.amount AS amount, t.punctuation AS punctuation,
                t.numbers AS numbers, t.alphabet AS alphabet, t.wpm AS wpm, t.accuracy AS accuracy,
                t.seconds AS seconds, t.created AS created
            FROM typing_results t
            WHERE t.ranked = TRUE`,
    },
    {
        name: 'dictation_public',
        listRule: '',
        viewRule: '',
        viewQuery: `
            SELECT d.id AS id, d.user AS user, d.dictation_id AS dictation_id, CAST(x.title AS TEXT) AS title,
                d.ball AS ball, d.baho AS baho, d.updated AS updated
            FROM dictation_works d
            JOIN dictations x ON x.id = d.dictation_id`,
    },
    { name: 'mistake_words', listRule: '', viewRule: '', viewQuery: MISTAKE_WORDS },
];

const LAST_SEEN_GUARD = '@request.body.last_seen:isset = false';

migrate(
    app => {
        const users = app.findCollectionByNameOrId('users');
        const avatar = users.fields.getByName('avatar');
        avatar.maxSize = 2 * 1024 * 1024;
        avatar.mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        avatar.thumbs = ['100x100', '256x256'];
        users.fields.add(new DateField({ name: 'last_seen' }));
        if (users.updateRule !== null && !users.updateRule.includes(LAST_SEEN_GUARD)) {
            users.updateRule = `(${users.updateRule || "@request.auth.id != ''"}) && ${LAST_SEEN_GUARD}`;
        }
        app.save(users);

        for (const [name, viewQuery] of leaderboards(true)) {
            const view = app.findCollectionByNameOrId(name);
            view.viewQuery = viewQuery;
            app.save(view);
        }

        for (const view of PUBLIC_VIEWS) {
            app.save(new Collection({ type: 'view', ...view }));
        }
    },
    app => {
        for (const view of PUBLIC_VIEWS) {
            app.delete(app.findCollectionByNameOrId(view.name));
        }

        for (const [name, viewQuery] of leaderboards(false)) {
            const view = app.findCollectionByNameOrId(name);
            view.viewQuery = viewQuery;
            app.save(view);
        }

        const users = app.findCollectionByNameOrId('users');
        users.fields.removeByName('last_seen');
        if (users.updateRule) {
            users.updateRule = users.updateRule.replace(/^\((.*)\) && @request\.body\.last_seen:isset = false$/, '$1');
        }
        app.save(users);
    }
);
