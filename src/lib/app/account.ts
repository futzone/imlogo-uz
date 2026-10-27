import PocketBase, { ClientResponseError, RecordModel } from 'pocketbase';

import { BASE_URL } from './pocketbase';
import { packSample, StoredSample, unpackSample } from './storage';
import { parseTypingConfig } from './typing/config';
import { TypingResult } from './typing/result';
import { Work } from './types';

/**
 * Hisob (ixtiyoriy): kirish, tez yozish natijalarini serverda saqlash,
 * umumiy reyting va murojaatlar. Sessiya brauzer xotirasida
 * (`pocketbase_auth`) saqlanadi. Server sxemasi — `pocketbase/` papkasida.
 */

let client: PocketBase | null = null;

export const pb = (): PocketBase => {
    if (!client) {
        client = new PocketBase(BASE_URL);
        // Bir xil so'rovlar (masalan, reyting yorliqlari tez almashtirilganda) bekor qilinmasin.
        client.autoCancellation(false);
    }
    return client;
};

export interface Account {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    /** Ro'yxatdan o'tgan sana (ISO). */
    createdAt: string;
}

export const toAccount = (record: RecordModel): Account => ({
    id: record.id,
    email: record.email ?? '',
    name: record.name || (record.email ?? '').split('@')[0],
    avatarUrl: record.avatar ? pb().files.getURL(record, record.avatar, { thumb: '100x100' }) : null,
    createdAt: (record.created ?? '').replace(' ', 'T'),
});

/** Server xatosini foydalanuvchiga tushunarli matnga aylantiradi. */
export const accountErrorMessage = (error: unknown): string => {
    if (!(error instanceof ClientResponseError)) return 'Kutilmagan xatolik yuz berdi';
    if (error.isAbort) return 'Sörov bekor qilindi';
    if (error.status === 0) return 'Server bilan aloqa yöq. Internetni tekşiring';
    const fields = (error.response?.data ?? {}) as Record<string, { code?: string }>;
    if (fields.email?.code === 'validation_not_unique') return 'Bu email bilan allaqaçon röyxatdan ötilgan';
    if (fields.email) return 'Email manzili notöğri';
    if (fields.password) return 'Parol kamida 8 ta belgidan iborat bölişi kerak';
    if (fields.name) return 'Ism juda uzun';
    if (error.status === 400 && error.url.includes('auth-with-password')) return 'Email yoki parol notöğri';
    if (error.status === 429) return 'Juda köp uriniş. Birozdan söng qayta urinib köring';
    return error.message || 'Kutilmagan xatolik yuz berdi';
};

export const signIn = (email: string, password: string) =>
    pb().collection('users').authWithPassword(email.trim(), password);

export const signUp = async (name: string, email: string, password: string) => {
    await pb().collection('users').create({
        name: name.trim(),
        email: email.trim(),
        password,
        passwordConfirm: password,
        emailVisibility: false,
    });
    return signIn(email, password);
};

/** Google orqali kirish — PocketBase yangi oynada Google sahifasini ochadi. */
export const signInWithGoogle = () => pb().collection('users').authWithOAuth2({ provider: 'google' });

export const updateName = (id: string, name: string) => pb().collection('users').update(id, { name: name.trim() });

/** Parolni almashtirish. Muvaffaqiyatdan so'ng PocketBase sessiyani bekor qiladi — qayta kiriladi. */
export const changePassword = async (account: Account, oldPassword: string, password: string) => {
    await pb().collection('users').update(account.id, { oldPassword, password, passwordConfirm: password });
    return signIn(account.email, password);
};

/** Parolni tiklash havolasini emailga yuboradi (serverda SMTP sozlangan bo'lishi kerak). */
export const requestPasswordReset = (email: string) => pb().collection('users').requestPasswordReset(email.trim());

// --- Tez yozish natijalari ---

interface TypingRecord extends RecordModel {
    local_id: string;
    mode: string;
    amount: number;
    punctuation: boolean;
    numbers: boolean;
    wpm: number;
    raw: number;
    accuracy: number;
    consistency: number;
    correct_chars: number;
    incorrect_chars: number;
    extra_chars: number;
    missed_chars: number;
    seconds: number;
    samples: StoredSample[] | null;
    created: string;
}

const fromTypingRecord = (record: TypingRecord): TypingResult => ({
    id: record.local_id || record.id,
    // PocketBase sanani "2026-02-25 05:27:05.102Z" ko'rinishida beradi.
    createdAt: record.created.replace(' ', 'T'),
    config: parseTypingConfig(record),
    wpm: record.wpm,
    raw: record.raw,
    accuracy: record.accuracy,
    consistency: record.consistency,
    correctChars: record.correct_chars,
    incorrectChars: record.incorrect_chars,
    extraChars: record.extra_chars,
    missedChars: record.missed_chars,
    seconds: record.seconds,
    samples: (record.samples ?? []).map(unpackSample),
});

export const uploadTypingResult = (userId: string, result: TypingResult) =>
    pb()
        .collection('typing_results')
        .create(
            {
                user: userId,
                local_id: result.id,
                mode: result.config.mode,
                amount: result.config.amount,
                punctuation: result.config.punctuation,
                numbers: result.config.numbers,
                alphabet: result.config.alphabet,
                wpm: result.wpm,
                raw: result.raw,
                accuracy: result.accuracy,
                consistency: result.consistency,
                correct_chars: result.correctChars,
                incorrect_chars: result.incorrectChars,
                extra_chars: result.extraChars,
                missed_chars: result.missedChars,
                seconds: result.seconds,
                samples: result.samples.map(packSample),
            },
            { requestKey: null }
        );

/** Foydalanuvchining serverdagi natijalari, eng yangisi birinchi. */
export const fetchMyTypingResults = async (userId: string): Promise<TypingResult[]> => {
    const list = await pb()
        .collection('typing_results')
        .getList<TypingRecord>(1, 500, { filter: pb().filter('user = {:id}', { id: userId }), sort: '-created' });
    return list.items.map(fromTypingRecord);
};

// --- Diktantlar ---

interface WorkRecord extends RecordModel {
    work: Work;
}

/** Har bir diktant uchun oxirgi natija saqlanadi (qurilmadagi kabi). */
export const uploadWork = async (userId: string, work: Work) => {
    const data = { user: userId, dictation_id: work.id, ball: work.ball, baho: work.baho, worktime: work.worktime, work };
    const works = pb().collection('dictation_works');
    try {
        const existing = await works.getFirstListItem(
            pb().filter('user = {:user} && dictation_id = {:id}', { user: userId, id: work.id }),
            { fields: 'id', requestKey: null }
        );
        return works.update(existing.id, data, { requestKey: null });
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) return works.create(data, { requestKey: null });
        throw error;
    }
};

export const fetchMyWorks = async (userId: string): Promise<Work[]> => {
    const list = await pb()
        .collection('dictation_works')
        .getList<WorkRecord>(1, 500, { filter: pb().filter('user = {:id}', { id: userId }), sort: '-updated' });
    return list.items.map(record => record.work);
};

export const fetchMyWork = async (userId: string, dictationId: string): Promise<Work | null> => {
    try {
        const record = await pb()
            .collection('dictation_works')
            .getFirstListItem<WorkRecord>(pb().filter('user = {:user} && dictation_id = {:id}', { user: userId, id: dictationId }));
        return record.work;
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) return null;
        throw error;
    }
};

// --- Reyting ---

export type Board = 'typing' | 'dictation';
/** `week` — joriy hafta (dushanbadan, Toshkent vaqti), `prev_week` — o'tgan hafta. */
export type LeaderboardPeriod = 'all' | 'week' | 'prev_week';

/** View kolleksiyalardagi qator: ism va son ko'rsatkichlar. */
export type LeaderRow = { id: string; name: string } & Record<string, number>;

const periodSuffix: Record<LeaderboardPeriod, string> = { all: '', week: '_week', prev_week: '_prev_week' };

const leaderboardCollection = (board: Board, period: LeaderboardPeriod) =>
    pb().collection(`${board}_leaderboard${periodSuffix[period]}`);

/**
 * Reyting: `metric` bo'yicha kamayish tartibida. `filter` — qatnashish sharti
 * (masalan, "games >= 10").
 */
export const fetchLeaderboard = async (
    board: Board,
    period: LeaderboardPeriod,
    metric: string,
    filter: string,
    limit = 50
): Promise<LeaderRow[]> => {
    const list = await leaderboardCollection(board, period).getList<LeaderRow & RecordModel>(1, limit, {
        filter,
        sort: `-${metric}`,
        skipTotal: true,
    });
    return list.items;
};

/** Foydalanuvchining shu reytingdagi o'rni (qatnashmagan bo'lsa — `null`). */
export const fetchMyRank = async (
    board: Board,
    period: LeaderboardPeriod,
    metric: string,
    filter: string,
    userId: string
): Promise<{ rank: number; row: LeaderRow } | null> => {
    const collection = leaderboardCollection(board, period);
    const mine = await collection.getList<LeaderRow & RecordModel>(1, 1, {
        filter: `(${filter}) && ${pb().filter('id = {:id}', { id: userId })}`,
        skipTotal: true,
    });
    const row = mine.items[0];
    if (!row) return null;
    const ahead = await collection.getList(1, 1, { filter: `(${filter}) && ${metric} > ${row[metric]}` });
    return { rank: ahead.totalItems + 1, row };
};

// --- Murojaatlar ---

export type FeedbackKind = 'xatolik' | 'taklif' | 'savol' | 'boshqa';

export const sendFeedback = (userId: string, kind: FeedbackKind, message: string, page: string) =>
    pb().collection('feedback').create({ user: userId, kind, message: message.trim(), page });
