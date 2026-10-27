/// <reference path="../pb_data/types.d.ts" />

/**
 * Tez yozishning "gaplar" rejimi: `typing_results.mode` endi `sentences`
 * qiymatini ham qabul qiladi (`amount` — gaplar soni).
 */
migrate(
    app => {
        const typing = app.findCollectionByNameOrId('typing_results');
        typing.fields.getByName('mode').values = ['time', 'words', 'sentences'];
        app.save(typing);
    },
    app => {
        const typing = app.findCollectionByNameOrId('typing_results');
        typing.fields.getByName('mode').values = ['time', 'words'];
        app.save(typing);
    }
);
