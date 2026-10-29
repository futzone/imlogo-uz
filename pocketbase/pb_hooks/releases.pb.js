/// <reference path="../pb_data/types.d.ts" />

/**
 * CI (github.com/futzone/imlogo, `.github/workflows`) yangi relizni shu yerga
 * yozadi — sayt yuklab olish havolasini `app_releases` dan oladi.
 *
 * POST /api/imlogo/releases  { platform, version, url, size }
 * Sarlavha: `X-Release-Token` = muhitdagi IMLOGO_RELEASE_TOKEN.
 */
routerAdd('POST', '/api/imlogo/releases', e => {
    const expected = $os.getenv('IMLOGO_RELEASE_TOKEN');
    const token = e.request.header.get('X-Release-Token');
    if (!expected || !token || !$security.equal(token, expected)) throw new UnauthorizedError('Token notoʻgʻri.');

    const body = e.requestInfo().body || {};
    const platform = String(body.platform || '');
    const version = String(body.version || '');
    const url = String(body.url || '');
    const size = Math.max(0, Math.floor(Number(body.size) || 0));
    if (!['windows', 'macos'].includes(platform)) throw new BadRequestError('platform: windows yoki macos.');
    if (!/^\d+\.\d+\.\d+$/.test(version)) throw new BadRequestError('version: 1.2.3 koʻrinishida.');
    // Token sizib chiqsa ham havola faqat loyiha relizlariga olib boradi.
    if (!url.startsWith('https://github.com/futzone/imlogo/releases/download/')) throw new BadRequestError('url notoʻgʻri.');

    let record;
    try {
        record = $app.findFirstRecordByData('app_releases', 'platform', platform);
    } catch (_) {
        record = new Record($app.findCollectionByNameOrId('app_releases'));
        record.set('platform', platform);
    }
    record.set('version', version);
    record.set('url', url);
    record.set('size', size);
    $app.save(record);
    return e.json(200, record);
});
