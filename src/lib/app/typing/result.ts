import { TypingConfig } from './config';
import { TypingEngine, TypingSample } from './engine';
import { TypingFlag } from './guard';

/** Yakunlangan bitta tez yozish mashqining natijasi (qurilmada saqlanadi). */
export interface TypingResult {
    id: string;
    createdAt: string;
    config: TypingConfig;
    wpm: number;
    raw: number;
    accuracy: number;
    consistency: number;
    correctChars: number;
    incorrectChars: number;
    extraChars: number;
    missedChars: number;
    seconds: number;
    samples: TypingSample[];
    /**
     * Shubhali natija belgilari (qarang: analyzeTyping). Bo'sh bo'lmasa, natija
     * reytingga ham, "yangi rekord" ga ham kirmaydi.
     */
    flags?: TypingFlag[];
}

/** Natija rekord va reyting uchun hisobga olinadimi. */
export const isTrustedTypingResult = (result: TypingResult): boolean => !result.flags || result.flags.length === 0;

export const typingResultFromEngine = (engine: TypingEngine): TypingResult => {
    const elapsed = engine.finishedAt ?? 0;
    const { wpm, raw, accuracy, consistency, correctChars, incorrectChars, extraChars, missedChars } =
        engine.stats(elapsed);
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        config: engine.config,
        wpm,
        raw,
        accuracy,
        consistency,
        correctChars,
        incorrectChars,
        extraChars,
        missedChars,
        seconds: elapsed / 1000,
        samples: [...engine.samples],
    };
};
