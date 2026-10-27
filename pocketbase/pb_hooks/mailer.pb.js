/// <reference path="../pb_data/types.d.ts" />

/**
 * Xatlarni SMTP o'rniga Brevo HTTP API (443-port) orqali yuborish.
 *
 * Hosting (HOSTKEY) barcha chiquvchi SMTP portlarini (25, 465, 587, 2525)
 * yopgan, HTTPS esa ochiq. PocketBase tayyorlagan xat (parolni tiklash va
 * h.k.) shu yerda ushlanib, Brevo API'ga jo'natiladi.
 *
 * Kalit muhit o'zgaruvchisidan olinadi: BREVO_API_KEY (Brevo → SMTP & API → API Keys).
 * Kalit berilmagan bo'lsa, PocketBase odatdagidek SMTP orqali yuboradi.
 */
onMailerSend(e => {
    const apiKey = $os.getenv('BREVO_API_KEY');
    if (!apiKey) return e.next();

    const message = e.message;
    const toList = list => (list || []).map(a => ({ email: a.address, name: a.name || undefined }));

    const payload = {
        sender: { email: message.from.address, name: message.from.name || 'Imlo Go' },
        to: toList(message.to),
        subject: message.subject,
        htmlContent: message.html || undefined,
        textContent: message.text || undefined,
    };
    if (message.cc && message.cc.length) payload.cc = toList(message.cc);
    if (message.bcc && message.bcc.length) payload.bcc = toList(message.bcc);

    const response = $http.send({
        url: 'https://api.brevo.com/v3/smtp/email',
        method: 'POST',
        headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(payload),
        timeout: 20,
    });

    if (response.statusCode >= 300) {
        throw new Error(`Brevo API xatosi (${response.statusCode}): ${JSON.stringify(response.json)}`);
    }
    // e.next() chaqirilmaydi — SMTP orqali qayta yuborishga urinilmaydi.
});
