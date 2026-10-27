/// <reference path="../pb_data/types.d.ts" />

/**
 * Tez yozish natijasi brauzerda hisoblanadi, shuning uchun reytingni soxta
 * natijalardan himoyalash uchun server ikki narsani tekshiradi:
 *
 * 1. Natija mantiqan to'g'ri: davomiylik sozlamaga, WPM va aniqlik terilgan
 *    belgilar va bosishlarga mos (`lib/integrity.js`). Aks holda rad etiladi.
 * 2. Real vaqt: oldingi reytingdagi natijadan beri kamida shu mashq
 *    davomiyligicha vaqt o'tgan. Aks holda natija saqlanadi (boshqa qurilmada
 *    ko'rinadi), lekin reytingga kirmaydi (`ranked = false`) — masalan,
 *    kirishdan oldingi natijalar birdaniga yuklanganda yoki skript bilan
 *    ketma-ket yuborilganda.
 */
onRecordCreateRequest(e => {
    const { checkTyping } = require(`${__hooks}/lib/integrity.js`);
    const record = e.record;

    let samples = null;
    try {
        samples = JSON.parse(record.getString('samples') || 'null');
    } catch (_) {
        throw new BadRequestError('Natija noto‘g‘ri.');
    }

    const seconds = record.getFloat('seconds');
    const error = checkTyping({
        mode: record.getString('mode'),
        amount: record.getInt('amount'),
        wpm: record.getFloat('wpm'),
        raw: record.getFloat('raw'),
        accuracy: record.getFloat('accuracy'),
        correct: record.getInt('correct_chars'),
        incorrect: record.getInt('incorrect_chars'),
        extra: record.getInt('extra_chars'),
        missed: record.getInt('missed_chars'),
        seconds,
        samples,
    });
    if (error) throw new BadRequestError(error);

    const last = $app.findRecordsByFilter(
        'typing_results',
        'user = {:user} && ranked = true',
        '-created',
        1,
        0,
        { user: record.getString('user') }
    );
    let ranked = true;
    if (last.length > 0) {
        const lastCreated = new Date(last[0].getString('created').replace(' ', 'T')).getTime();
        ranked = Date.now() - lastCreated >= (seconds - 2) * 1000;
    }
    record.set('ranked', ranked);

    e.next();
}, 'typing_results');
