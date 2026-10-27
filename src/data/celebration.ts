/**
 * O‘zbek tili bayrami — 21-oktyabr. 1989-yil shu kuni «Davlat tili
 * to‘g‘risida»gi qonun qabul qilinib, o‘zbek tiliga davlat tili maqomi berilgan.
 *
 * Banner va badge har yili 21-oktyabrdan 3 kun oldin chiqa boshlaydi va 3 kundan
 * keyin yo‘qoladi (18–24-oktyabr, Toshkent vaqti bilan). Oldindan ko‘rish uchun istalgan sahifaga `?bayram=1` qo‘shing.
 */
export const celebration = {
    id: 'til-bayrami',
    /** "OO-KK" ko‘rinishida, ikkala chegara ham kiradi */
    from: '10-18',
    to: '10-24',
    sinceYear: 1989,
    badge: (years: number) => `21-oktyabr — Özbek tili bayrami · ${years} yil`,
    title: (years: number) => `Özbek tiliga davlat tili maqomi berilganiga ${years} yil!`,
    text: (years: number) =>
        `1989-yil 21-oktyabrda «Davlat tili töğrisida»gi qonun qabul qilinib, ona tilimizga davlat tili maqomi berildi. Şu sananing ${years} yilligi — Özbek tili bayrami bilan barçangizni çin dildan tabriklaymiz!`,
    cta: { text: 'Bayram diktantini yozing', href: '/app' },
};

/** Toshkent vaqti bo‘yicha yil va "OO-KK" sana. */
const tashkentDate = (now: Date) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tashkent',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(now);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return { year: Number(get('year')), monthDay: `${get('month')}-${get('day')}` };
};

export const isCelebrationDay = (now: Date = new Date()) => {
    const { monthDay } = tashkentDate(now);
    return monthDay >= celebration.from && monthDay <= celebration.to;
};

/** Qonun qabul qilinganiga necha yil bo‘lgani (2026-yilda — 37). */
export const celebrationYears = (now: Date = new Date()) => tashkentDate(now).year - celebration.sinceYear;
