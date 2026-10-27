import { siteDetails } from '@/data/siteDetails';
import { AppInfo, Dictation } from './types';

export const BASE_URL = 'https://admin.imlogo.uz';
const PER_PAGE = 20;

interface DictationRecord {
    id: string;
    collectionId: string;
    title?: string;
    text?: string;
    class?: string;
    age?: string;
    time?: number;
    audio?: string;
    created?: string;
}

const toDictation = (record: DictationRecord): Dictation => {
    const text = record.text ?? '';
    return {
        id: record.id,
        title: record.title ?? '',
        text,
        className: record.class ?? '',
        ageName: record.age ?? '',
        length: text.split(/\s+/).filter(Boolean).length,
        time: record.time ?? 0,
        url: record.audio
            ? `${BASE_URL}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(record.audio)}`
            : null,
        // PocketBase sanani "2026-02-25 05:27:05.102Z" ko'rinishida beradi.
        createdDate: record.created ? record.created.replace(' ', 'T') : null,
    };
};

const getJson = async <T>(path: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) throw new Error(`Server xatosi (${response.status})`);
    return response.json();
};

export const fetchDictations = async (page: number): Promise<{ items: Dictation[]; totalPages: number }> => {
    const result = await getJson<{ items: DictationRecord[]; totalPages: number }>(
        `/api/collections/dictations/records?page=${page}&perPage=${PER_PAGE}&sort=-created`
    );
    return { items: result.items.map(toDictation), totalPages: result.totalPages };
};

export const fetchDictation = async (id: string): Promise<Dictation> =>
    toDictation(await getJson<DictationRecord>(`/api/collections/dictations/records/${encodeURIComponent(id)}`));

export const fetchAppInfo = async (): Promise<AppInfo> => {
    const result = await getJson<{ items: Record<string, string | undefined>[] }>(
        '/api/collections/app/records?perPage=1&skipTotal=1'
    );
    const data = result.items[0];
    if (!data) throw new Error("Ma'lumot topilmadi");
    return {
        about: data.about ?? '',
        // Kanal manzili serverdagi qiymatga bog'liq emas.
        telegram: siteDetails.telegramChannel,
        website: data.website || null,
        github: data.github || null,
        docs: data.docs || null,
        license: data.license || null,
    };
};
