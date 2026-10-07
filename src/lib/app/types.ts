export interface Dictation {
    id: string;
    title: string;
    text: string;
    className: string;
    ageName: string;
    /** Matndagi so'zlar soni */
    length: number;
    /** Diktant uchun ajratilgan vaqt (daqiqa) */
    time: number;
    url: string | null;
    createdDate: string | null;
}

export type ErrorType = 'IMLO' | 'PUNKTUATSION' | 'USLUBIY' | 'GRAFIK';

export const errorTypeNames: Record<ErrorType, string> = {
    IMLO: 'Imloviy',
    PUNKTUATSION: 'Punktuatsion',
    USLUBIY: 'Uslubiy',
    GRAFIK: 'Grafik',
};

export interface DetectedError {
    type: ErrorType;
    description: string;
    originalFragment: string;
    userFragment: string;
    specificRuleCode: string;
    penaltyMultiplier: number;
}

/** Topshirilgan bitta diktant natijasi (qurilmada saqlanadi). */
export interface Work {
    id: string;
    createdDate: string;
    ball: number;
    baho: number;
    errors: DetectedError[];
    text: Dictation;
    imloErrorCount: number;
    punktuatsionErrorCount: number;
    uslubiyErrorCount: number;
    grafikErrorCount: number;
    /** Sarflangan vaqt (soniya) */
    worktime: number;
    input: string;
}

export interface AppInfo {
    about: string;
    telegram: string | null;
    website: string | null;
    github: string | null;
    docs: string | null;
    license: string | null;
}
