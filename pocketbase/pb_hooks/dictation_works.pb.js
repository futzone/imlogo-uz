/// <reference path="../pb_data/types.d.ts" />

/**
 * Diktant natijasi serverda qayta baholanadi: brauzer yuborgan `ball` va
 * `baho` hisobga olinmaydi (`lib/integrity.js` → `rescoreDictationWork`).
 * Handlerlar tashqi o'zgaruvchilarni ko'rmaydi, shuning uchun mantiq
 * `require()` orqali olinadi.
 */
onRecordCreateRequest(e => {
    require(`${__hooks}/lib/integrity.js`).rescoreDictationWork(e);
}, 'dictation_works');

onRecordUpdateRequest(e => {
    require(`${__hooks}/lib/integrity.js`).rescoreDictationWork(e);
}, 'dictation_works');
