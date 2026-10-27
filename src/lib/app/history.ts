import { fetchMyTypingResults, fetchMyWorks, uploadTypingResult, uploadWork } from './account';
import { loadTypingResults, loadWorks } from './storage';
import { TypingResult } from './typing/result';
import { Work } from './types';

/**
 * Foydalanuvchining barcha natijalari: qurilmadagi va (kirgan bo'lsa)
 * serverdagi natijalar birlashtiriladi. Bir marta yuklanib, yangi natija
 * qo'shilganda (`invalidateHistory`) qayta o'qiladi.
 */
export interface History {
    typing: TypingResult[];
    works: Work[];
    /** Hisobga hali yuklanmagan, faqat shu qurilmadagi natijalar. */
    unsyncedTyping: TypingResult[];
    unsyncedWorks: Work[];
}

let cache: { userId: string | null; promise: Promise<History> } | null = null;
const listeners = new Set<() => void>();

const byDateDesc = <T>(date: (item: T) => string) => (a: T, b: T) => date(b).localeCompare(date(a));

const build = async (userId: string | null): Promise<History> => {
    const localTyping = loadTypingResults();
    const localWorks = loadWorks();
    if (!userId) return { typing: localTyping, works: localWorks, unsyncedTyping: [], unsyncedWorks: [] };

    const [remoteTyping, remoteWorks] = await Promise.all([fetchMyTypingResults(userId), fetchMyWorks(userId)]);
    const typingIds = new Set(remoteTyping.map(r => r.id));
    const unsyncedTyping = localTyping.filter(r => !typingIds.has(r.id));
    // Diktant bo'yicha qurilmadagi natija serverdagidan yangiroq bo'lsa, u ham yuklanmagan hisoblanadi.
    const remoteWorkDates = new Map(remoteWorks.map(w => [w.id, w.createdDate]));
    const unsyncedWorks = localWorks.filter(w => {
        const remote = remoteWorkDates.get(w.id);
        return remote === undefined || remote < w.createdDate;
    });
    const unsyncedWorkIds = new Set(unsyncedWorks.map(w => w.id));

    return {
        typing: [...remoteTyping, ...unsyncedTyping].sort(byDateDesc(r => r.createdAt)),
        works: [...remoteWorks.filter(w => !unsyncedWorkIds.has(w.id)), ...unsyncedWorks].sort(
            byDateDesc(w => w.createdDate)
        ),
        unsyncedTyping,
        unsyncedWorks,
    };
};

export const loadHistory = (userId: string | null): Promise<History> => {
    if (!cache || cache.userId !== userId) {
        const promise = build(userId).catch(() => {
            // Server javob bermasa, hech bo'lmaganda qurilmadagi natijalar ko'rsatiladi.
            cache = null;
            return build(null);
        });
        cache = { userId, promise };
    }
    return cache.promise;
};

export const invalidateHistory = () => {
    cache = null;
    listeners.forEach(listener => listener());
};

export const subscribeHistory = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

/** Qurilmadagi natijalarni hisobga yuklaydi (ketma-ket — server so'rovlar chastotasini cheklaydi). */
export const syncHistory = async (userId: string, history: History) => {
    for (const result of history.unsyncedTyping) await uploadTypingResult(userId, result).catch(() => undefined);
    for (const work of history.unsyncedWorks) await uploadWork(userId, work).catch(() => undefined);
    invalidateHistory();
};

// --- Ketma-ket kunlar (streak) ---

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export interface Streak {
    /** Bugun yoki kechagacha uzilmagan ketma-ket faol kunlar. */
    current: number;
    best: number;
    activeToday: boolean;
}

/** Mashq yoki diktant bajarilgan kunlar asosida (mahalliy vaqt bo'yicha). */
export const computeStreak = (history: History): Streak => {
    const days = new Set(
        [...history.typing.map(r => r.createdAt), ...history.works.map(w => w.createdDate)]
            .map(iso => new Date(iso))
            .filter(date => !Number.isNaN(date.getTime()))
            .map(dayKey)
    );
    const shift = (date: Date, by: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + by);

    const today = new Date();
    const activeToday = days.has(dayKey(today));
    let current = 0;
    for (let day = activeToday ? today : shift(today, -1); days.has(dayKey(day)); day = shift(day, -1)) current++;

    let best = 0;
    for (const key of Array.from(days)) {
        const [y, m, d] = key.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        // Faqat ketma-ketlik boshidan sanaladi.
        if (days.has(dayKey(shift(date, -1)))) continue;
        let length = 0;
        while (days.has(dayKey(shift(date, length)))) length++;
        best = Math.max(best, length);
    }
    return { current, best, activeToday };
};
