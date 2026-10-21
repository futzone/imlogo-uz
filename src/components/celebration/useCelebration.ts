'use client';

import { useEffect, useState } from 'react';

import { celebration, celebrationYears, isCelebrationDay } from '@/data/celebration';

const dismissKey = (year: number) => `imlogo:${celebration.id}:${year}:dismissed`;

/**
 * Bayram kuni ekanini faqat brauzerda tekshiradi: sahifalar statik
 * yig‘iladi, shuning uchun server vaqtiga tayanib bo‘lmaydi.
 */
export const useCelebration = () => {
    const [active, setActive] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [years, setYears] = useState(0);

    useEffect(() => {
        const now = new Date();
        const preview = new URLSearchParams(window.location.search).get('bayram') === '1';
        setActive(preview || isCelebrationDay(now));
        setYears(celebrationYears(now));
        try {
            setDismissed(window.localStorage.getItem(dismissKey(now.getFullYear())) === '1');
        } catch {
            // Xotira yopiq — banner har safar ko‘rinadi.
        }
    }, []);

    const dismiss = () => {
        setDismissed(true);
        try {
            window.localStorage.setItem(dismissKey(new Date().getFullYear()), '1');
        } catch {
            // Saqlanmasa ham banner shu tashrif davomida yopiq turadi.
        }
    };

    return { active, dismissed, years, dismiss };
};
