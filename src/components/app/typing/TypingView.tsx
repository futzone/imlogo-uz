'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { LuPointer, LuRefreshCw } from 'react-icons/lu';
import clsx from 'clsx';

import Badge from '@/components/ui/Badge';
import { startTypingTest, submitTypingTest, uploadTypingResult } from '@/lib/app/account';
import { invalidateHistory } from '@/lib/app/history';
import { loadTypingConfig, loadTypingResults, saveTypingConfig, saveTypingResult } from '@/lib/app/storage';
import { defaultTypingConfig, effectiveTypingConfig, isSameTypingConfig, TypingConfig } from '@/lib/app/typing/config';
import { TypingEngine } from '@/lib/app/typing/engine';
import { analyzeTyping, TypingFlag, typingFlagMessages, TypingLogEntry } from '@/lib/app/typing/guard';
import { applyTypingValue, TypingInputState } from '@/lib/app/typing/input';
import { replayTypingLog } from '@/lib/app/typing/replay';
import { isTrustedTypingResult, TypingResult, typingResultFromEngine } from '@/lib/app/typing/result';
import { createSentenceWords, createWordGenerator, loadTypingPool } from '@/lib/app/typing/words';
import { useAuth } from '../auth/AuthProvider';
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
/** Bu turdagi kiritishlar (nusxalab qo'yish, sudrab tashlash, avtomatik tuzatish) bloklanadi. */
const BLOCKED_INPUT_TYPES = new Set(['insertFromPaste', 'insertFromDrop', 'insertReplacementText', 'insertFromYank']);

/** Natija ostidagi izoh: nega reytingga yoki rekordga kirmadi. */
const flagNotice = (flags: TypingFlag[], signedIn: boolean): string =>
    `${signedIn ? 'Natija reytingga kiritilmadi' : 'Natija rekordga kiritilmadi'}: ${flags
        .map(flag => typingFlagMessages[flag])
        .join(', ')}`;

/** Bir xil kalitli sozlamalar bitta so'zlar to'plamidan foydalanadi. */
const poolKey = (config: TypingConfig) => `${config.alphabet}:${config.mode === 'sentences' ? 'gaplar' : 'sözlar'}`;

/** Tez yozish mashqi (monkeytype uslubida, o'zbekcha so'zlar bilan). */
const TypingView: React.FC = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Mashq boshlangan payt (`performance.now()`); boshlanmagan bo'lsa — `null`.
    const startedAtRef = useRef<number | null>(null);
    const configRef = useRef<TypingConfig>(defaultTypingConfig);
    const firstEngineRef = useRef(true);
    // Yangi alifbo: "s" terilib, "h" kutilayotgan harf o'rni (qarang: composeYangi).
    const inputStateRef = useRef<TypingInputState>({ pending: null });
    // Oxirgi kiritishdan keyin bosilgan haqiqiy (brauzer yuborgan) klavish.
    const lastKeyRef = useRef<string | null>(null);
    // Bosishlar logi: server natijani shundan qayta hisoblaydi (qarang: replayTypingLog).
    const logRef = useRef<TypingLogEntry[]>([]);
    // Server bergan mashq (kirgan foydalanuvchi uchun); `null` — mashq qurilmada yaratilgan.
    const testIdRef = useRef<string | null>(null);
    // Eskirgan so'rov javobi yangi mashqni almashtirib yubormasligi uchun.
    const restartIdRef = useRef(0);

    // Dvigatel o'zgaruvchan obyekt — har o'zgarishda ekran qo'lda yangilanadi.
    const [, rerender] = useReducer((count: number) => count + 1, 0);
    const [pool, setPool] = useState<string[] | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [config, setConfig] = useState<TypingConfig>(defaultTypingConfig);
    const [engine, setEngine] = useState<TypingEngine | null>(null);
    const [result, setResult] = useState<TypingResult | null>(null);
    const [previousBest, setPreviousBest] = useState<number | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [focused, setFocused] = useState(false);
    const { account } = useAuth();
    const accountRef = useRef(account);
    accountRef.current = account;

    const elapsed = () => (startedAtRef.current === null ? 0 : performance.now() - startedAtRef.current);

    const stopTimer = () => {
        if (timerRef.current !== null) clearInterval(timerRef.current);
        timerRef.current = null;
    };

    const restart = useCallback((words: string[], nextConfig: TypingConfig) => {
        stopTimer();
        const restartId = ++restartIdRef.current;
        startedAtRef.current = null;
        inputStateRef.current = { pending: null };
        lastKeyRef.current = null;
        logRef.current = [];
        testIdRef.current = null;
        setResult(null);
        setPreviousBest(null);
        setNotice(null);
        const config = effectiveTypingConfig(nextConfig);
        const startLocal = () => {
            const source =
                config.mode === 'sentences' ? createSentenceWords(words, config.amount) : createWordGenerator(words, config);
            setEngine(new TypingEngine(config, source));
        };
        if (!accountRef.current) {
            startLocal();
            return;
        }
        // Kirgan foydalanuvchi uchun so'zlarni server beradi — natija reytingga kirishi uchun.
        // Server javob bermasa, mashq qurilmada davom etadi (natija reytingga kirmaydi).
        setEngine(null);
        startTypingTest(config)
            .then(test => {
                if (restartId !== restartIdRef.current) return;
                testIdRef.current = test.id;
                setEngine(new TypingEngine(config, test.words));
            })
            .catch(() => {
                if (restartId === restartIdRef.current) startLocal();
            });
    }, []);

    useEffect(() => {
        const saved = loadTypingConfig();
        configRef.current = saved;
        setConfig(saved);
        loadTypingPool(saved)
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

    // Nusxalab qo'yish, sudrab tashlash va avtomatik tuzatish maydonga umuman tushmaydi.
    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;
        const block = (event: InputEvent) => {
            if (BLOCKED_INPUT_TYPES.has(event.inputType)) event.preventDefault();
        };
        input.addEventListener('beforeinput', block);
        return () => input.removeEventListener('beforeinput', block);
    }, [engine]);

    // Kirish/chiqishdan keyin boshlanmagan mashq qayta yaratiladi: kirgan foydalanuvchi
    // so'zlarni serverdan oladi (aks holda natija reytingga kirmaydi).
    const accountId = account?.id ?? null;
    const accountIdRef = useRef(accountId);
    useEffect(() => {
        if (accountIdRef.current === accountId) return;
        accountIdRef.current = accountId;
        if (pool && engine && !engine.started && result === null) restart(pool, configRef.current);
    }, [accountId, pool, engine, result, restart]);

    const restartNow = () => {
        if (pool) restart(pool, configRef.current);
    };

    const changeConfig = (next: TypingConfig) => {
        const poolChanged = poolKey(next) !== poolKey(configRef.current);
        configRef.current = next;
        setConfig(next);
        saveTypingConfig(next);
        if (!poolChanged) {
            if (pool) restart(pool, next);
            return;
        }
        setEngine(null);
        loadTypingPool(next)
            .then(words => {
                // Yuklanish paytida yana boshqa yozuv yoki rejim tanlangan bo'lishi mumkin.
                if (poolKey(configRef.current) !== poolKey(next)) return;
                setPool(words);
                restart(words, configRef.current);
            })
            .catch(() => setLoadFailed(true));
    };

    const finish = (finished: TypingEngine) => {
        stopTimer();
        const account = accountRef.current;
        const log = logRef.current;
        const testId = testIdRef.current;
        const restartId = restartIdRef.current;
        // Brauzer ham natijani server bilan bir xil evristikalar bo'yicha darhol tekshiradi.
        const localResult = typingResultFromEngine(finished);
        const { events } = replayTypingLog(finished.config, finished.words, log);
        const flags = analyzeTyping(events, localResult.wpm);
        if (account && !testId) flags.push('unverified');
        const finishedResult: TypingResult = { ...localResult, flags: flags.length ? flags : undefined };

        const show = (shown: TypingResult) => {
            const sameConfig = loadTypingResults().filter(
                r => isSameTypingConfig(r.config, shown.config) && isTrustedTypingResult(r) && r.id !== shown.id
            );
            // Shubhali natija "yangi rekord" bo'lmaydi.
            const trusted = isTrustedTypingResult(shown);
            setPreviousBest(!trusted || sameConfig.length === 0 ? null : Math.max(...sameConfig.map(r => r.wpm)));
            setNotice(trusted ? null : flagNotice(shown.flags ?? [], account !== null));
            setResult(shown);
        };
        show(finishedResult);
        // Natija ko'rsatilganda klaviatura (Enter, Esc) shu blokda tinglanadi.
        rootRef.current?.focus();

        // Hech narsa terilmagan mashq tarixga yozilmaydi.
        if (finishedResult.correctChars + finishedResult.incorrectChars === 0) return;
        saveTypingResult(finishedResult);

        if (!account) {
            invalidateHistory();
            return;
        }
        if (testId) {
            // Server natijani logdan qayta hisoblaydi va reytingga kiritish-kiritmasligini hal qiladi.
            submitTypingTest(testId, finishedResult.id, log)
                .then(verdict => {
                    const verified: TypingResult = { ...verdict.result, flags: verdict.flags.length ? verdict.flags : undefined };
                    saveTypingResult(verified);
                    if (restartId === restartIdRef.current) show(verified);
                })
                .catch(() => {
                    // Yuborilmadi — natija tarixga oddiy usulda yoziladi (reytingga kirmaydi).
                    const unverified: TypingResult = { ...finishedResult, flags: [...flags, 'unverified'] };
                    saveTypingResult(unverified);
                    if (restartId === restartIdRef.current) show(unverified);
                    return uploadTypingResult(account.id, unverified).catch(() => undefined);
                })
                .finally(invalidateHistory);
            return;
        }
        // Kirgan foydalanuvchi natijasi serverga ham yoziladi; yozilmasa, qurilmada qoladi
        // va "Natijalarim" sahifasidan keyinroq yuklanadi.
        uploadTypingResult(account.id, finishedResult)
            .catch(() => undefined)
            .finally(invalidateHistory);
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!engine || engine.finished) return;
        const input = event.target;
        const value = input.value;
        const now = elapsed();

        // JS yuborgan soxta hodisa umuman qabul qilinmaydi. Klavish bosilmasdan yoki bir
        // hodisada bir nechta belgi kiritilgani esa qabul qilinadi, lekin logda qoladi va
        // natija shubhali deb belgilanadi (qarang: analyzeTyping).
        const native = event.nativeEvent as InputEvent;
        if (!native.isTrusted) {
            input.value = SENTINEL + engine.current;
            return;
        }
        const text = value.startsWith(SENTINEL) ? value.slice(SENTINEL.length) : null;
        logRef.current.push({ t: Math.round(now * 10) / 10, v: text, it: native.inputType ?? '', k: lastKeyRef.current });
        lastKeyRef.current = null;
        applyTypingValue(engine, inputStateRef.current, text, Math.round(now * 10) / 10);

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
        if (inTest && event.nativeEvent.isTrusted) lastKeyRef.current = key.slice(0, 16);
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
                Sözlar töplamini yuklab bölmadi
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
    const hint = {
        lotin: 'o‘, g‘ uçun istalgan tutuq belgisi qabul qilinadi',
        yangi: 'ş, ç, ö, ğ — sh, ch, o‘, g‘ deb ham teriş mumkin',
        kirill: 'kirill klaviatura tartibini yoqing',
    }[config.alphabet];

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
                        notice={notice ?? undefined}
                        onRestart={restartNow}
                        historyHref="/app/natijalar?tab=1"
                    />
                ) : (
                    <div className="text-[20px] sm:text-[24px] xl:text-[28px]">
                        {!engine.started && (
                            <Badge pulse className="mb-3">
                                {config.alphabet === 'kirill' ? 'Ўзбекча сўзлар' : config.alphabet === 'yangi' ? 'Özbekça sözlar' : 'O‘zbekcha so‘zlar'}
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
                                aria-label="Ekrandagi sözlarni tering"
                                defaultValue={SENTINEL}
                                onChange={handleInput}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                onPaste={event => event.preventDefault()}
                                onDrop={event => event.preventDefault()}
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
                                    Boşlaş uçun şu yerga bosing
                                </span>
                            )}
                        </div>

                        <div className="mt-5 flex items-center justify-center gap-2 font-mono text-[11px] font-medium text-muted">
                            <IconButton
                                icon={<LuRefreshCw size={20} aria-hidden />}
                                tooltip="Qayta boşlaş"
                                onClick={restartNow}
                            />
                            <span className="hidden sm:inline">tab — qayta boşlaş &nbsp;·&nbsp; {hint}</span>
                        </div>
                        <p className="mt-1 text-center font-mono text-[11px] font-medium text-muted sm:hidden">{hint}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TypingView;
