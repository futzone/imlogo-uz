/// <reference path="../pb_data/types.d.ts" />

/**
 * Oxirgi faollik vaqti (`users.last_seen`, qarang: `lib/profiles.js`).
 * Kirish va sessiyani yangilashda, shuningdek ilova ochiq turganda
 * davriy `POST /api/imlogo/ping` so'rovida belgilanadi.
 */
routerAdd(
    'POST',
    '/api/imlogo/ping',
    e => {
        require(`${__hooks}/lib/profiles.js`).touch(e.auth.id);
        return e.noContent(204);
    },
    $apis.requireAuth('users')
);

onRecordAuthRequest(e => {
    e.next();
    require(`${__hooks}/lib/profiles.js`).touch(e.record.id);
}, 'users');
