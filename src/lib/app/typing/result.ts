import { TypingConfig } from './config';
import { TypingEngine, TypingSample } from './engine';

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
}

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
