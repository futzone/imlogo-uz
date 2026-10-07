'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { TypingEngine } from '@/lib/app/typing/engine';
import { isSameTypingChar, isTypedWordCorrect, prettifyTypingWord } from '@/lib/app/typing/text';

const VISIBLE_LINES = 3;
const PROBE = '0'.repeat(20);

const inputFor = (engine: TypingEngine, index: number): string => {
    if (index < engine.typed.length) return engine.typed[index];
    return index === engine.index ? engine.current : '';
};

/**
 * So'zlarni qatorlarga bo'ladi va ko'rinadigan uch qatorni qaytaradi.
 * Mono shriftda barcha belgilar eni bir xil, shuning uchun hisob belgilar sonida yuritiladi.
 */
const visibleLines = (engine: TypingEngine, maxChars: number): number[][] => {
    const lines: number[][] = [];
    let line: number[] = [];
    let used = 0;
    let currentLine: number | null = null;

    for (let i = 0; i < engine.words.length; i++) {
        const length = Math.max(engine.words[i].length, inputFor(engine, i).length);
        // Har bir so'zdan keyin bitta belgi enidagi bo'sh joy ham qatorga sig'ishi kerak.
        if (line.length > 0 && used + length + 1 > maxChars) {
            lines.push(line);
            line = [];
            used = 0;
            if (currentLine !== null && lines.length > currentLine + VISIBLE_LINES) break;
        }
        if (i === engine.index) currentLine = lines.length;
        line.push(i);
        used += length + 1;
    }
    if (line.length > 0) lines.push(line);

    const first = Math.max(0, (currentLine ?? 0) - 1);
    return lines.slice(first, first + VISIBLE_LINES);
};

interface Props {
    engine: TypingEngine;
    focused: boolean;
}

/**
 * Teriladigan so'zlar maydoni: uch qator ko'rinadi, joriy so'z doim
 * ikkinchi qatorda turadi (birinchi qatordan tashqari). Shrift o'lchami
 * ota elementdan olinadi.
 */
const TypingWords: React.FC<Props> = ({ engine, focused }) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const probeRef = useRef<HTMLSpanElement>(null);
    const [maxChars, setMaxChars] = useState<number | null>(null);

    useLayoutEffect(() => {
        const wrap = wrapRef.current;
        const probe = probeRef.current;
        if (!wrap || !probe) return;

        const measure = () => {
            const charWidth = probe.getBoundingClientRect().width / PROBE.length;
            if (charWidth > 0) setMaxChars(wrap.clientWidth / charWidth);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(wrap);
        observer.observe(probe);
        return () => observer.disconnect();
    }, []);

    const lines = maxChars === null ? [] : visibleLines(engine, maxChars);

    return (
        <div ref={wrapRef} className="relative h-[5.7em] w-full font-mono font-normal">
            <span ref={probeRef} aria-hidden className="invisible absolute whitespace-pre">
                {PROBE}
            </span>
            {lines.map(line => (
                // Qatordan uzun bitta so'z (tor ekran + ortiqcha belgilar) chetidan kesilib ko'rinadi.
                <div key={line[0]} className="flex h-[1.9em] items-center overflow-hidden whitespace-nowrap">
                    {line.map(index => (
                        <Word key={index} engine={engine} index={index} focused={focused} />
                    ))}
                </div>
            ))}
        </div>
    );
};

const Word: React.FC<Props & { index: number }> = ({ engine, index, focused }) => {
    const word = engine.words[index];
    const pretty = prettifyTypingWord(word);
    const input = inputFor(engine, index);
    const isActive = index === engine.index && !engine.finished;
    const hasError = index < engine.typed.length && !isTypedWordCorrect(input, word);

    return (
        <span
            className={clsx(
                'relative mr-[1ch] shrink-0 border-b-2 leading-[1.4]',
                hasError ? 'border-danger' : 'border-transparent'
            )}
        >
            {word.split('').map((char, j) => (
                <span
                    key={j}
                    className={
                        j >= input.length
                            ? 'text-muted/45'
                            : isSameTypingChar(input[j], char)
                              ? 'text-foreground'
                              : 'text-danger'
                    }
                >
                    {pretty[j]}
                </span>
            ))}
            {input.length > word.length && <span className="text-danger-deep/70">{input.slice(word.length)}</span>}
            {isActive && focused && (
                <span
                    aria-hidden
                    className={clsx(
                        'absolute bottom-[0.1em] top-[0.1em] w-[2.5px] rounded-sm bg-primary shadow-glow transition-[left] duration-100 ease-out',
                        // Yozish boshlangach kursor miltillamaydi.
                        !engine.started && 'animate-caret-blink'
                    )}
                    style={{ left: `calc(${input.length}ch - 1px)` }}
                />
            )}
        </span>
    );
};

export default TypingWords;
