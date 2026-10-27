/// <reference path="../pb_data/types.d.ts" />

/**
 * Server tekshiradigan tez yozish mashqi (qarang: `lib/typing_api.js`).
 * Handlerlar tashqi o'zgaruvchilarni ko'rmaydi, shuning uchun mantiq
 * `require()` orqali olinadi.
 *
 * POST /api/imlogo/typing/start  { mode, amount, punctuation, numbers, alphabet } → { id, words }
 * POST /api/imlogo/typing/submit { testId, localId, log: [{ t, v, it, k }] }  → { record, ranked, flags }
 */
routerAdd(
    'POST',
    '/api/imlogo/typing/start',
    e => require(`${__hooks}/lib/typing_api.js`).start(e),
    $apis.requireAuth('users')
);

routerAdd(
    'POST',
    '/api/imlogo/typing/submit',
    e => require(`${__hooks}/lib/typing_api.js`).submit(e),
    $apis.requireAuth('users')
);

cronAdd('imlogo_typing_tests_cleanup', '17 3 * * *', () => {
    require(`${__hooks}/lib/typing_api.js`).cleanup();
});
