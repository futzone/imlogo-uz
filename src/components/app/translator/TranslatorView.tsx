'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { LuArrowRightLeft, LuCheck, LuCopy, LuDownload, LuEraser, LuInfo } from 'react-icons/lu';

import { Alphabet, Lexicon, transliterate } from '@/lib/translit/core';
import { alphabetNames, Direction, findDirection } from '@/lib/translit/directions';
import { loadLexicon } from '@/lib/translit/lexicon';
import DashboardPage from '../DashboardPage';
import { Segmented } from '../form';
import { cardClass } from '../ui';

const STORAGE_KEY = 'imlogo:translator-text';
const alphabets: Alphabet[] = ['lotin', 'yangi', 'kirill'];
const alphabetOptions = alphabets.map(value => ({ value, label: alphabetNames[value] }));
const emptyLexicon: Lexicon = new Map();

/** Yangi alifbo harflari — oddiy klaviaturada yo'q, shuning uchun tugma bilan qo'yiladi. */
const specialLetters: Record<Alphabet, string[]> = {
    yangi: ['Ş', 'ş', 'Ç', 'ç', 'Ö', 'ö', 'Ğ', 'ğ', 'ʼ'],
    lotin: ['Oʻ', 'oʻ', 'Gʻ', 'gʻ', 'ʼ'],
    kirill: ['Ў', 'ў', 'Қ', 'қ', 'Ғ', 'ғ', 'Ҳ', 'ҳ', 'ъ'],
};

const placeholders: Record<Alphabet, string> = {
    lotin: 'Matnni kiriting… Masalan: O‘zbekiston, shahar, choyxona, Ishoq',
    yangi: 'Matnni kiriting… Masalan: Özbekiston, şahar, çoyxona, Ishoq',
    kirill: 'Матнни киритинг… Масалан: Ўзбекистон, шаҳар, чойхона, Исҳоқ',
};

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

const readStored = (): string => {
    try {
        return window.localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
        return '';
    }
};

/** Transliteratsiya: kirill, amaldagi lotin va yangi lotin alifbolari orasida. */
const TranslatorView: React.FC<{ direction: Direction }> = ({ direction }) => {
    const router = useRouter();
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [text, setText] = useState('');
    const [lexicon, setLexicon] = useState<Lexicon>(emptyLexicon);
    const [plainApostrophe, setPlainApostrophe] = useState(false);
    const [copied, setCopied] = useState(false);
    const { from, to } = direction;

    useEffect(() => {
        setText(readStored());
        // Lug'at yuklanguncha qoidalar bo'yicha o'giriladi, so'ng natija yangilanadi.
        loadLexicon().then(setLexicon, () => undefined);
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, text);
        } catch {
            // Xotira yopiq — matn saqlanmaydi.
        }
    }, [text]);

    const output = useMemo(
        () => transliterate(text, from, to, lexicon, { plainApostrophe }),
        [text, from, to, lexicon, plainApostrophe]
    );

    const go = (nextFrom: Alphabet, nextTo: Alphabet) => {
        if (nextFrom === nextTo) nextTo = alphabets.find(a => a !== nextFrom && a !== to) ?? to;
        const next = findDirection(nextFrom, nextTo);
        if (next) router.replace(`/app/translator/${next.slug}`, { scroll: false });
    };

    const swap = () => {
        setText(output);
        go(to, from);
    };

    const insert = (letter: string) => {
        const input = inputRef.current;
        if (!input) return;
        const { selectionStart, selectionEnd } = input;
        setText(text.slice(0, selectionStart) + letter + text.slice(selectionEnd));
        requestAnimationFrame(() => {
            input.focus();
            input.setSelectionRange(selectionStart + letter.length, selectionStart + letter.length);
        });
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Brauzer ruxsat bermadi.
        }
    };

    const download = () => {
        const url = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `imlogo-${direction.slug}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const toolButton =
        'inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted transition-colors hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40';

    return (
        <DashboardPage
            title={direction.title}
            subtitle="Matn kiritilişi bilan ögiriladi. Ishoq, ashob (s+h) kabi istisnolar va tutuq belgisi luğat asosida hisobga olinadi."
        >
            <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <Segmented className="flex w-full sm:w-auto" options={alphabetOptions} value={from} onChange={value => go(value, to)} />
                <button
                    type="button"
                    onClick={swap}
                    title="Yönalişni almaştiriş"
                    aria-label="Yönalişni almaştiriş"
                    className="mx-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-primary transition-all hover:rotate-180 hover:border-primary sm:mx-0"
                >
                    <LuArrowRightLeft size={18} aria-hidden />
                </button>
                <Segmented className="flex w-full sm:w-auto" options={alphabetOptions} value={to} onChange={value => go(from, value)} />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <section className={clsx(cardClass, 'flex flex-col overflow-hidden')}>
                    <div className="flex items-center justify-between border-b border-line px-4 py-2">
                        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                            {alphabetNames[from]}
                        </h2>
                        <button type="button" onClick={() => setText('')} disabled={!text} className={toolButton}>
                            <LuEraser size={14} aria-hidden />
                            Tozalaş
                        </button>
                    </div>
                    <textarea
                        ref={inputRef}
                        value={text}
                        onChange={event => setText(event.target.value)}
                        placeholder={placeholders[from]}
                        spellCheck={false}
                        aria-label={`${alphabetNames[from]} matn`}
                        className="min-h-[260px] flex-1 resize-y bg-transparent p-4 text-base leading-relaxed caret-primary !outline-none placeholder:text-muted/60"
                    />
                    <div className="flex flex-wrap items-center gap-1 border-t border-line px-3 py-2">
                        {specialLetters[from].map(letter => (
                            <button
                                key={letter}
                                type="button"
                                onClick={() => insert(letter)}
                                className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg border border-line bg-white px-1.5 font-mono text-sm hover:border-primary hover:text-primary"
                            >
                                {letter}
                            </button>
                        ))}
                        <span className="ml-auto font-mono text-[11px] text-muted">
                            {countWords(text)} söz · {text.length} belgi
                        </span>
                    </div>
                </section>

                <section className={clsx(cardClass, 'flex flex-col overflow-hidden bg-surface')}>
                    <div className="flex items-center justify-between border-b border-line px-4 py-2">
                        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                            {alphabetNames[to]}
                        </h2>
                        <div className="flex items-center">
                            <button type="button" onClick={download} disabled={!output} className={toolButton}>
                                <LuDownload size={14} aria-hidden />
                                <span className="hidden sm:inline">Yuklab oliş</span>
                            </button>
                            <button type="button" onClick={copy} disabled={!output} className={toolButton}>
                                {copied ? <LuCheck size={14} aria-hidden /> : <LuCopy size={14} aria-hidden />}
                                {copied ? 'Nusxalandi' : 'Nusxalaş'}
                            </button>
                        </div>
                    </div>
                    <div
                        aria-live="polite"
                        className="min-h-[260px] flex-1 whitespace-pre-wrap break-words p-4 text-base leading-relaxed"
                    >
                        {output || <span className="text-muted/60">Natija şu yerda çiqadi</span>}
                    </div>
                    {to !== 'kirill' && (
                        <label className="flex cursor-pointer items-center gap-2 border-t border-line px-4 py-2.5 text-sm text-muted">
                            <input
                                type="checkbox"
                                checked={plainApostrophe}
                                onChange={event => setPlainApostrophe(event.target.checked)}
                                className="h-4 w-4 accent-[rgb(var(--primary-rgb))]"
                            />
                            Oddiy apostrof (&apos;) işlatilsin
                            <span className="text-muted/70">— {to === 'lotin' ? 'oʻ, gʻ, ʼ örniga' : 'ʼ örniga'}</span>
                        </label>
                    )}
                </section>
            </div>

            <AlphabetNote />
        </DashboardPage>
    );
};

const changes = [
    ['Oʻ oʻ', 'Ö ö'],
    ['Gʻ gʻ', 'Ğ ğ'],
    ['Sh sh', 'Ş ş'],
    ['Ch ch', 'Ç ç'],
];

/** Yangi alifbo o'zgarishlari va istisnolar haqida qisqa izoh. */
const AlphabetNote: React.FC = () => (
    <section className={clsx(cardClass, 'mt-6 p-5 sm:p-6')}>
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
            <LuInfo size={18} className="text-primary" aria-hidden />
            Yangi alifboda nima özgaradi?
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {changes.map(([before, after]) => (
                <div key={before} className="rounded-xl border border-line bg-surface px-3 py-2.5 text-center font-mono">
                    <span className="text-muted">{before}</span>
                    <span className="mx-2 text-primary">→</span>
                    <span className="font-semibold">{after}</span>
                </div>
            ))}
        </div>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted">
            <li>
                <b className="text-foreground">ng</b> mustaqil harf sifatida alifbodan çiqariladi — n va g alohida yoziladi
                (tong, singil), şuning uçun özgarmaydi.
            </li>
            <li>
                <b className="text-foreground">s + h</b> alohida tovuşlar bölgan sözlar (Ishoq, ashob, mushaf) yangi
                alifboda ham <i>sh</i> bölib qoladi, eski lotinda esa <i>Isʼhoq</i> şaklida ajratiladi.
            </li>
            <li>
                Tutuq belgisi (<b className="text-foreground">ʼ</b>) saqlanadi: sanʼat, maʼno. Kirillçaga ögirişda ц, ь, ё
                kabi harflar 3 mingdan ortiq sözdan iborat luğat yordamida tiklanadi (компьютер, цирк, район).
            </li>
        </ul>
    </section>
);

export default TranslatorView;
