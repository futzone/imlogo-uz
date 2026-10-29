/// <reference path="../pb_data/types.d.ts" />

/**
 * Kompyuter ilovalari relizlari (Windows, macOS): sayt yuklab olish
 * havolasini shu yerdan oladi. Fayllar GitHub Releases'da turadi, yozuvni
 * faqat CI `POST /api/imlogo/releases` orqali yangilaydi
 * (`pb_hooks/releases.pb.js`). Hamma o'qiy oladi.
 */
migrate(
    app => {
        app.save(
            new Collection({
                type: 'base',
                name: 'app_releases',
                listRule: '',
                viewRule: '',
                createRule: null,
                updateRule: null,
                deleteRule: null,
                fields: [
                    { name: 'platform', type: 'select', required: true, maxSelect: 1, values: ['windows', 'macos'] },
                    { name: 'version', type: 'text', required: true, max: 32 },
                    { name: 'url', type: 'url', required: true, onlyDomains: ['github.com'] },
                    { name: 'size', type: 'number', onlyInt: true, min: 0 },
                    { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
                    { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
                ],
                indexes: ['CREATE UNIQUE INDEX `idx_app_releases_platform` ON `app_releases` (`platform`)'],
            })
        );
    },
    app => {
        app.delete(app.findCollectionByNameOrId('app_releases'));
    }
);
