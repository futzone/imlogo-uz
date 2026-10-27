/// <reference path="../pb_data/types.d.ts" />

/**
 * `users` kolleksiyasida Google orqali kirishni yoqadi. Client ID va secret
 * kodda emas, serverdagi `/opt/pocketbase/.env` faylidan olinadi:
 * GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
 * Google ism va rasmi foydalanuvchining `name` va `avatar` maydonlariga yoziladi.
 */
migrate(
    app => {
        const clientId = $os.getenv('GOOGLE_CLIENT_ID');
        const clientSecret = $os.getenv('GOOGLE_CLIENT_SECRET');
        if (!clientId || !clientSecret) throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET berilmagan');

        const users = app.findCollectionByNameOrId('users');
        const providers = (users.oauth2.providers || [])
            .filter(p => p.name !== 'google')
            .map(p => ({ name: p.name, clientId: p.clientId, clientSecret: p.clientSecret }));
        providers.push({ name: 'google', clientId, clientSecret });

        unmarshal(
            {
                oauth2: {
                    enabled: true,
                    mappedFields: { id: '', name: 'name', username: '', avatarURL: 'avatar' },
                    providers,
                },
            },
            users
        );
        app.save(users);
    },
    app => {
        const users = app.findCollectionByNameOrId('users');
        users.oauth2.providers = (users.oauth2.providers || []).filter(p => p.name !== 'google');
        users.oauth2.enabled = users.oauth2.providers.length > 0;
        app.save(users);
    }
);
