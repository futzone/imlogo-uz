import { defaultTypingConfig, parseTypingConfig, TypingConfig } from './typing/config';
import { TypingSample } from './typing/engine';
import { TypingResult } from './typing/result';
import { Work } from './types';

/**
 * Natijalar va sozlamalar faqat shu qurilmada, brauzerning `localStorage`
 * xotirasida saqlanadi.
 */
const KEYS = {
    works: 'imlogo:works',
    typingResults: 'imlogo:typing-results',
    typingConfig: 'imlogo:typing-config',
};

const read = <T>(key: string, fallback: T): T => {
    try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
        return fallback;
    }
};

const write = (key: string, value: unknown) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Xotira to'lgan yoki o'chirilgan — natija saqlanmaydi, ilova ishlashda davom etadi.
    }
};

// --- Diktantlar ---

type WorkMap = Record<string, Work>;

/** Topshirilgan diktantlar, eng yangisi birinchi. */
export const loadWorks = (): Work[] =>
    Object.values(read<WorkMap>(KEYS.works, {})).sort((a, b) => b.createdDate.localeCompare(a.createdDate));

export const loadWork = (id: string): Work | null => read<WorkMap>(KEYS.works, {})[id] ?? null;

/** Har bir diktant uchun oxirgi natija saqlanadi. */
export const saveWork = (work: Work) => {
    write(KEYS.works, { ...read<WorkMap>(KEYS.works, {}), [work.id]: work });
};

// --- Tez yozish ---

// Grafik kesimlari ixcham ko'rinishda saqlanadi: [soniya, wpm, xom, xatolar].
type StoredSample = [number, number, number, number];
type StoredTypingResult = Omit<TypingResult, 'samples'> & { samples: StoredSample[] };

const round1 = (value: number) => Math.round(value * 10) / 10;

const packSample = (s: TypingSample): StoredSample => [s.second, round1(s.wpm), s.raw, s.errors];
const unpackSample = ([second, wpm, raw, errors]: StoredSample): TypingSample => ({ second, wpm, raw, errors });

/** Saqlangan natijalar, eng yangisi birinchi. */
export const loadTypingResults = (): TypingResult[] => {
    const results: TypingResult[] = [];
    for (const item of read<StoredTypingResult[]>(KEYS.typingResults, [])) {
        try {
            results.push({ ...item, config: parseTypingConfig(item.config), samples: item.samples.map(unpackSample) });
        } catch {
            // Buzilgan yozuv tashlab ketiladi.
        }
    }
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const saveTypingResult = (result: TypingResult) => {
    const stored: StoredTypingResult = { ...result, samples: result.samples.map(packSample) };
    write(KEYS.typingResults, [...read<StoredTypingResult[]>(KEYS.typingResults, []), stored]);
};

export const loadTypingConfig = (): TypingConfig => {
    const raw = read<unknown>(KEYS.typingConfig, null);
    return raw === null ? defaultTypingConfig : parseTypingConfig(raw);
};

export const saveTypingConfig = (config: TypingConfig) => write(KEYS.typingConfig, config);
