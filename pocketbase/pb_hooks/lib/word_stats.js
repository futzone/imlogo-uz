/// <reference path="../../pb_data/types.d.ts" />

/**
 * "Qiyin so'zlar": tez yozishda har bir foydalanuvchi har bir so'zni necha
 * marta tergani va shundan nechtasida xato qilgani (`typing_word_stats`).
 * Faqat reytingga kirgan (server tekshirgan, shubhasiz) mashqlardan yoziladi.
 * `attempts` — `lib/typing.js` dagi `typingWordAttempts(engine)` natijasi.
 */

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const pbDate = ms => new Date(ms).toISOString().replace('T', ' ');

const record = (app, userId, attempts) => {
    const byWord = {};
    for (const attempt of attempts) {
        const stat = byWord[attempt.word] || (byWord[attempt.word] = { attempts: 0, mistakes: 0 });
        stat.attempts++;
        if (attempt.mistaken) stat.mistakes++;
    }
    const now = pbDate(Date.now());
    for (const word of Object.keys(byWord)) {
        app.db()
            .newQuery(
                'INSERT INTO typing_word_stats (id, user, word, attempts, mistakes, created, updated) ' +
                    'VALUES ({:id}, {:user}, {:word}, {:attempts}, {:mistakes}, {:now}, {:now}) ' +
                    'ON CONFLICT (user, word) DO UPDATE SET attempts = attempts + excluded.attempts, ' +
                    'mistakes = mistakes + excluded.mistakes, updated = excluded.updated'
            )
            .bind({
                id: $security.randomStringWithAlphabet(15, ID_ALPHABET),
                user: userId,
                word,
                attempts: byWord[word].attempts,
                mistakes: byWord[word].mistakes,
                now,
            })
            .execute();
    }
};

module.exports = { record };
