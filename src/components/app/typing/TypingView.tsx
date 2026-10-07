'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { LuPointer, LuRefreshCw } from 'react-icons/lu';
import clsx from 'clsx';

import Badge from '@/components/ui/Badge';
import { loadTypingConfig, loadTypingResults, saveTypingConfig, saveTypingResult } from '@/lib/app/storage';
import { defaultTypingConfig, isSameTypingConfig, TypingConfig } from '@/lib/app/typing/config';
import { TypingEngine } from '@/lib/app/typing/engine';
import { TypingResult, typingResultFromEngine } from '@/lib/app/typing/result';
import { createWordGenerator, loadTypingWords } from '@/lib/app/typing/words';
import { IconButton, Spinner } from '../ui';
import TypingConfigBar from './TypingConfigBar';
import TypingResultView from './TypingResultView';
import TypingWords from './TypingWords';

/**
 * Yashirin kiritish maydoni hech qachon bo'sh bo'lmasligi uchun boshiga
 * qo'yiladigan ko'rinmas belgi (zero-width space): u o'chsa, demak bo'sh
 * holatda "o'chirish" bosilgan (mobil klaviaturada buni boshqacha aniqlab bo'lmaydi).
 */
const SENTINEL = String.fromCharCode(0x200b);
const TICK_MS = 100;

/** Tez yozish mashqi (monkeytype uslubida, o'zbekcha so'zlar bilan). */
const TypingView: React.FC = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Mashq boshlangan payt (`performance.now()`); boshlanmagan bo'lsa — `null`.
    const startedAtRef = useRef<number | null>(null);
    const configRef = useRef<TypingConfig>(defaultTypingConfig);
    const firstEngineRef = useRef(true);

    // Dvigatel o'zgaruvchan obyekt — har o'zgarishda ekran qo'lda yangilanadi.
    const [, rerender] = useReducer((count: number) => count + 1, 0);
    const [pool, setPool] = useState<string[] | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [config, setConfig] = useState<TypingConfig>(defaultTypingConfig);
    const [engine, setEngine] = useState<TypingEngine | null>(null);
    const [result, setResult] = useState<TypingResult | null>(null);
    const [previousBest, setPreviousBest] = useState<number | null>(null);
    const [focused, setFocused] = useState(false);

    const elapsed = () => (startedAtRef.current === null ? 0 : performance.now() - startedAtRef.current);

    const stopTimer = () => {
        if (timerRef.current !== null) clearInterval(timerRef.current);
        timerRef.current = null;
    };

    const restart = useCallback((words: string[], nextConfig: TypingConfig) => {
        stopTimer();
        startedAtRef.current = null;
        setResult(null);
        setPreviousBest(null);
        setEngine(new TypingEngine(nextConfig, createWordGenerator(words, nextConfig)));
    }, []);

    useEffect(() => {
        const saved = loadTypingConfig();
        configRef.current = saved;
        setConfig(saved);
        loadTypingWords()
            .then(words => {
                setPool(words);
                restart(words, saved);
            })
            .catch(() => setLoadFailed(true));
        return stopTimer;
    }, [restart]);

    // Yangi mashq boshlanganda kiritish maydoni tozalanadi va fokus oladi.
    useEffect(() => {
        const input = inputRef.current;
        if (!engine || !input) return;
        input.value = SENTINEL;
        // Telefonda sahifa ochilishi bilan fokus olinmaydi — klaviatura foydalanuvchi bosgandagina chiqadi.
        const firstOnTouch = firstEngineRef.current && window.matchMedia('(pointer: coarse)').matches;
        firstEngineRef.current = false;
        if (!firstOnTouch) input.focus();
    }, [engine]);

    const restartNow = () => {
        if (pool) restart(pool, configRef.current);
    };

    const changeConfig = (next: TypingConfig) => {
        configRef.current = next;
        setConfig(next);
        saveTypingConfig(next);
        if (pool) restart(pool, next);
    };

    const finish = (finished: TypingEngine) => {
        stopTimer();
        const finishedResult = typingResultFromEngine(finished);
        const sameConfig = loadTypingResults().filter(r => isSameTypingConfig(r.config, finishedResult.config));

        setPreviousBest(sameConfig.length === 0 ? null : Math.max(...sameConfig.map(r => r.wpm)));
        setResult(finishedResult);
        // Natija ko'rsatilganda klaviatura (Enter, Esc) shu blokda tinglanadi.
        rootRef.current?.focus();

        // Hech narsa terilmagan mashq tarixga yozilmaydi.
        if (finishedResult.correctChars + finishedResult.incorrectChars > 0) saveTypingResult(finishedResult);
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!engine || engine.finished) return;
        const input = event.target;
        const value = input.value;
        const now = elapsed();

        if (!value.startsWith(SENTINEL)) {
            engine.backToPreviousWord();
        } else {
            const text = value.slice(SENTINEL.length);
            const space = text.search(/\s/);
            if (space >= 0) {
                engine.setCurrent(text.slice(0, space), now);
                engine.commitWord(now);
            } else {
                engine.setCurrent(text, now);
            }
        }

        if (engine.started && startedAtRef.current === null && !engine.finished) {
            startedAtRef.current = performance.now();
            timerRef.current = setInterval(() => {
                engine.tick(elapsed());
                if (engine.finished) finish(engine);
                else rerender();
            }, TICK_MS);
        }

        // Maydon qiymati dvigatel holati bilan moslashtiriladi (ortiqcha belgilar kesiladi).
        input.value = SENTINEL + engine.current;
        input.setSelectionRange(input.value.length, input.value.length);

        if (engine.finished) finish(engine);
        else rerender();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const { target, key } = event;
        const inTest = target === inputRef.current;
        const onControl = target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement;
        const restartKey =
            key === 'Escape' || (key === 'Tab' && inTest) || (key === 'Enter' && result !== null && !onControl);

        if (restartKey) {
            event.preventDefault();
            restartNow();
        } else if (inTest && ['ArrowLeft', 'ArrowUp', 'Home'].includes(key)) {
            // Kursor doim matn oxirida turishi kerak.
            event.preventDefault();
        }
    };

    if (loadFailed) {
        return (
            <p className="flex flex-1 items-center justify-center p-6 text-center text-[15px] text-muted">
                So‘zlar to‘plamini yuklab bo‘lmadi
            </p>
        );
    }
    if (!engine) return <Spinner className="flex-1" />;

    const running = engine.started && result === null;
    const now = elapsed();
    const counter =
        config.mode === 'time'
            ? `${Math.max(0, config.amount - Math.floor(now / 1000))}`
            : `${engine.typed.length}/${engine.words.length}`;
    const hint = 'o‘, g‘ uchun istalgan tutuq belgisi qabul qilinadi';

    return (
        <div
            ref={rootRef}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-4 pb-2 pt-4 !outline-none sm:px-6"
        >
            {/* Yozish paytida sozlamalar xiralashadi — diqqat matnda qoladi. */}
            <div className={clsx('transition-opacity duration-[250ms]', running && 'pointer-events-none opacity-25')}>
                <TypingConfigBar config={config} onChange={changeConfig} />
            </div>

            <div className="flex flex-1 flex-col justify-center py-4">
                {result ? (
                    <TypingResultView
                        result={result}
                        previousBest={previousBest}
                        onRestart={restartNow}
                        historyHref="/app/natijalar?tab=1"
                    />
                ) : (
                    <div className="text-[20px] sm:text-[24px] xl:text-[28px]">
                        {!engine.started && (
                            <Badge pulse className="mb-3">
                                O‘zbekcha so‘zlar
                            </Badge>
                        )}
                        <div className="flex items-end gap-4 font-mono font-medium">
                            <span className="text-gradient text-[1.3em] leading-none" role="timer">
                                {counter}
                            </span>
                            {engine.started && (
                                <span className="pb-[3px] text-sm leading-tight text-muted">
                                    {Math.round(engine.stats(now).wpm)} wpm
                                </span>
                            )}
                        </div>

                        <div
                            className="relative mt-3 flex cursor-text items-center justify-center"
                            onClick={() => inputRef.current?.focus()}
                        >
                            <div className={clsx('w-full transition-opacity duration-200', !focused && 'opacity-30')}>
                                <TypingWords engine={engine} focused={focused} />
                            </div>
                            {/* Klaviaturadan kiritishni qabul qiladigan ko'rinmas maydon. */}
                            <input
                                ref={inputRef}
                                data-typing-input
                                aria-label="Ekrandagi so‘zlarni tering"
                                defaultValue={SENTINEL}
                                onChange={handleInput}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                onPaste={event => event.preventDefault()}
                                type="text"
                                inputMode="text"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                enterKeyHint="next"
                                className="absolute left-0 top-0 h-px w-px border-0 bg-transparent p-0 text-base opacity-0 outline-none"
                            />
                            {!focused && (
                                <span className="absolute inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/90 px-[18px] py-2.5 font-mono text-[11px] font-medium uppercase leading-tight tracking-[0.14em] text-primary shadow-glow">
                                    <LuPointer size={16} aria-hidden />
                                    Boshlash uchun shu yerga bosing
                                </span>
                            )}
                        </div>

                        <div className="mt-5 flex items-center justify-center gap-2 font-mono text-[11px] font-medium text-muted">
                            <IconButton
                                icon={<LuRefreshCw size={20} aria-hidden />}
                                tooltip="Qayta boshlash"
                                onClick={restartNow}
                            />
                            <span className="hidden sm:inline">tab — qayta boshlash &nbsp;·&nbsp; {hint}</span>
                        </div>
                        <p className="mt-1 text-center font-mono text-[11px] font-medium text-muted sm:hidden">{hint}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TypingView;
