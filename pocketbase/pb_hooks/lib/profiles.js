/// <reference path="../../pb_data/types.d.ts" />

/** Bir daqiqadan tez-tez yozilmaydi — bazaga ortiqcha yuk tushmasin. */
const MIN_INTERVAL_MS = 60 * 1000;

/** PocketBase sana formati: "2026-10-29 10:00:00.000Z". */
const pbDate = ms => new Date(ms).toISOString().replace('T', ' ');

/**
 * `users.last_seen` ni hozirgi vaqtga o'rnatadi. To'g'ridan-to'g'ri SQL:
 * `updated` o'zgarmaydi va yozuv hooklari ishga tushmaydi.
 */
const touch = userId => {
    const now = Date.now();
    $app.db()
        .newQuery("UPDATE users SET last_seen = {:now} WHERE id = {:id} AND (last_seen IS NULL OR last_seen = '' OR last_seen < {:since})")
        .bind({ now: pbDate(now), since: pbDate(now - MIN_INTERVAL_MS), id: userId })
        .execute();
};

module.exports = { touch };
