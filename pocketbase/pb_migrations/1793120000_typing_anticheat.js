/// <reference path="../pb_data/types.d.ts" />

/**
 * Server tekshiradigan tez yozish mashqi (`pb_hooks/typing_api.pb.js`):
 *
 * - `typing_tests` — server bergan mashq: sozlama, so'zlar, bir martalik
 *   belgisi va (yuborilgach) bosishlar logi. API orqali o'qib/yozib bo'lmaydi,
 *   faqat marshrutlar ishlatadi.
 * - `typing_results.verified` — natija server tomonidan logdan qayta hisoblangan;
 *   `flagged` / `flag_reasons` — shubhali natija (reytingga kirmaydi). Bu
 *   maydonlarni faqat server belgilaydi, so'rovda yuborib bo'lmaydi.
 */

const OWNER_CREATE = "@request.auth.id != '' && user = @request.auth.id";
const RANKED_GUARD = '@request.body.ranked:isset = false';
const VERIFY_GUARD =
    '@request.body.verified:isset = false && @request.body.flagged:isset = false && @request.body.flag_reasons:isset = false';

migrate(
    app => {
        const users = app.findCollectionByNameOrId('users');
        app.save(
            new Collection({
                type: 'base',
                name: 'typing_tests',
                listRule: null,
                viewRule: null,
                createRule: null,
                updateRule: null,
                deleteRule: null,
                fields: [
                    { name: 'user', type: 'relation', required: true, collectionId: users.id, cascadeDelete: true, maxSelect: 1 },
                    { name: 'mode', type: 'select', required: true, maxSelect: 1, values: ['time', 'words', 'sentences'] },
                    { name: 'amount', type: 'number', required: true, onlyInt: true, min: 1, max: 1000 },
                    { name: 'punctuation', type: 'bool' },
                    { name: 'numbers', type: 'bool' },
                    { name: 'alphabet', type: 'select', maxSelect: 1, values: ['lotin', 'yangi', 'kirill'] },
                    { name: 'words', type: 'json', maxSize: 200000 },
                    { name: 'used', type: 'bool' },
                    { name: 'log', type: 'json', maxSize: 2000000 },
                    { name: 'result', type: 'text', max: 32 },
                    { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
                    { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
                ],
                indexes: ['CREATE INDEX `idx_typing_tests_user_created` ON `typing_tests` (`user`, `created`)'],
            })
        );

        const typing = app.findCollectionByNameOrId('typing_results');
        typing.fields.add(new BoolField({ name: 'verified' }));
        typing.fields.add(new BoolField({ name: 'flagged' }));
        typing.fields.add(new JSONField({ name: 'flag_reasons', maxSize: 2000 }));
        typing.createRule = `${OWNER_CREATE} && ${RANKED_GUARD} && ${VERIFY_GUARD}`;
        app.save(typing);
    },
    app => {
        const typing = app.findCollectionByNameOrId('typing_results');
        for (const name of ['verified', 'flagged', 'flag_reasons']) typing.fields.removeByName(name);
        typing.createRule = `${OWNER_CREATE} && ${RANKED_GUARD}`;
        app.save(typing);
        app.delete(app.findCollectionByNameOrId('typing_tests'));
    }
);
