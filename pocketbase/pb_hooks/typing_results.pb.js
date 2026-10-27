/// <reference path="../pb_data/types.d.ts" />

/**
 * To'g'ridan-to'g'ri yuklangan tez yozish natijasi (kirishdan oldingi yoki
 * yuborilmay qolgan natijalar, ilovaning eski versiyalari): u brauzerda
 * hisoblangan, server uni tasdiqlay olmaydi. Shuning uchun natija mantiqan
 * tekshiriladi (`lib/integrity.js`, aks holda rad etiladi) va faqat tarixda
 * saqlanadi — reytingga kirmaydi (`ranked = false`, `verified = false`).
 *
 * Reytingga faqat server tekshirgan mashqlar kiradi: `typing_api.pb.js`.
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
        seconds: record.getFloat('seconds'),
        samples,
    });
    if (error) throw new BadRequestError(error);

    record.set('ranked', false);
    record.set('verified', false);
    record.set('flagged', false);

    e.next();
}, 'typing_results');
