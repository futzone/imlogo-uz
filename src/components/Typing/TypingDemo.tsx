'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { LuRotateCcw } from 'react-icons/lu';

import { demoWords } from '@/data/typing';
import { isSameChar, isWordCorrect, pickWords, prettifyWord } from './typingUtils';

const WORD_COUNT = 18;

interface Result {
    wpm: number;
    accuracy: number;
}

/** Tez yozish modulining sahifadagi kichik, ishlaydigan namunasi */
const TypingDemo: React.FC = () => {
    // Server va brauzer bir xil natija chizishi uchun boshlang'ich to'plam tasodifiy emas
    const [words, setWords] = useState<string[]>(() => demoWords.slice(0, WORD_COUNT));
    const [typed, setTyped] = useState<string[]>([]);
    const [current, setCurrent] = useState('');
    const [focused, setFocused] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const startedAt = useRef<number | null>(null);
    const keystrokes = useRef({ total: 0, correct: 0 });

    const restart = useCallback(() => {
        setWords(pickWords(demoWords, WORD_COUNT));
        setTyped([]);
        setCurrent('');
        setResult(null);
        startedAt.current = null;
        keystrokes.current = { total: 0, correct: 0 };
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        setWords(pickWords(demoWords, WORD_COUNT));
    }, []);

    const finish = (allTyped: string[]) => {
        const minutes = Math.max((Date.now() - (startedAt.current ?? Date.now())) / 60000, 1 / 600);
        // Faqat to'g'ri terilgan so'zlarning belgilari (bo'sh joy bilan) hisobga olinadi
        const correctChars = allTyped.reduce((sum, value, i) => {
            return isWordCorrect(value, words[i]) ? sum + words[i].length + 1 : sum;
        }, 0);
        const { total, correct } = keystrokes.current;
        setResult({
            wpm: Math.round(correctChars / 5 / minutes),
            accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
        });
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (result) return;
        const value = event.target.value;
        const target = words[typed.length];

        if (/\s$/.test(value)) {
            const word = value.trim();
            if (!word) return;
            const next = [...typed, word];
            setTyped(next);
            setCurrent('');
            if (next.length === words.length) finish(next);
            return;
        }

        if (value.length > current.length) {
            if (startedAt.current === null) startedAt.current = Date.now();
            const index = value.length - 1;
            keystrokes.current.total += 1;
            if (index < target.length && isSameChar(value[index], target[index])) {
                keystrokes.current.correct += 1;
            }
        }

        // Oxirgi so'z to'liq va to'g'ri terilsa, bo'sh joy kutmasdan yakunlanadi
        const isLastWord = typed.length === words.length - 1;
        if (isLastWord && isWordCorrect(value, target)) {
            const next = [...typed, value];
            setTyped(next);
            setCurrent('');
            finish(next);
            return;
        }

        setCurrent(value.slice(0, target.length + 6));
    };

    const renderWord = (word: string, index: number) => {
        const isActive = index === typed.length && !result;
        const input = index < typed.length ? typed[index] : isActive ? current : '';
        const pretty = prettifyWord(word);
        const extra = input.slice(word.length);
        const hasError = index < typed.length && !isWordCorrect(input, word);

        return (
            <span
                key={`${word}-${index}`}
                className={clsx(
                    'relative mr-[1ch] inline-block border-b-2',
                    hasError ? 'border-red-400' : 'border-transparent'
                )}
            >
                {pretty.split('').map((char, j) => (
                    <span
                        key={j}
                        className={clsx(
                            j >= input.length
                                ? 'text-muted/50'
                                : isSameChar(input[j], word[j])
                                  ? 'text-foreground'
                                  : 'text-red-500'
                        )}
                    >
                        {char}
                    </span>
                ))}
                {extra && <span className="text-red-700/70">{extra}</span>}
                {isActive && focused && (
                    <span
                        aria-hidden
                        className="absolute bottom-[0.15em] top-[0.15em] w-0.5 rounded-full bg-primary shadow-glow transition-[left] duration-100 animate-caret-blink"
                        style={{ left: `${input.length}ch` }}
                    />
                )}
            </span>
        );
    };

    return (
        <div className="glass relative overflow-hidden rounded-2xl shadow-glow-soft">
            {/* "Terminal" sarlavhasi */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-widest text-muted">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    Jonli namuna
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                    {Math.min(typed.length, words.length)}/{words.length} söz
                </span>
            </div>

            <div
                className="relative cursor-text px-5 py-8 md:px-8 md:py-10"
                onClick={() => inputRef.current?.focus()}
            >
                <input
                    ref={inputRef}
                    value={current}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={(event) => {
                        if (event.key === 'Tab' || (event.key === 'Enter' && result)) {
                            event.preventDefault();
                            restart();
                        }
                    }}
                    aria-label="Tez yoziş namunasi: ekrandagi sözlarni tering"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="absolute left-0 top-0 h-px w-px opacity-0"
                />

                <div
                    className={clsx(
                        'select-none font-mono text-xl leading-[2.1] transition duration-300 md:text-2xl md:leading-[2.1]',
                        (!focused || result) && 'opacity-40 blur-[3px]'
                    )}
                >
                    {words.map(renderWord)}
                </div>

                {!focused && !result && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="rounded-full border border-primary/30 bg-white/90 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-primary shadow-glow">
                            Boşlaş uçun şu yerga bosing
                        </span>
                    </div>
                )}

                {result && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/75">
                        <div className="flex items-end gap-8">
                            <div className="text-center">
                                <div className="font-mono text-5xl font-medium text-gradient">{result.wpm}</div>
                                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">söz/daqiqa</div>
                            </div>
                            <div className="text-center">
                                <div className="font-mono text-5xl font-medium text-foreground">{result.accuracy}%</div>
                                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">aniqlik</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                restart();
                            }}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-primary/25 px-5 font-body text-sm font-semibold transition-all duration-300 hover:border-primary hover:bg-primary/5"
                        >
                            <LuRotateCcw size={16} aria-hidden />
                            Qayta uriniş
                        </button>
                    </div>
                )}
            </div>

            <div className="border-t border-line px-5 py-3 font-mono text-[11px] text-muted">
                <kbd className="rounded border border-line bg-white px-1.5 py-0.5">tab</kbd> — qayta boşlaş
                <span className="mx-2 opacity-40">·</span>
                o‘, g‘ uçun istalgan tutuq belgisi (&apos; ‘ ’ ʻ `) qabul qilinadi
            </div>
        </div>
    );
};

export default TypingDemo;
