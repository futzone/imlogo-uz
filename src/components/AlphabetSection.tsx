'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { LuArrowRight } from 'react-icons/lu';

import Button from './ui/Button';
import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';
import { Lexicon, transliterate } from '@/lib/translit/core';
import { loadLexicon } from '@/lib/translit/lexicon';

const SAMPLE = "O‘zbekiston — go‘zal o‘lka. Shaharda choyxona to‘la, tog‘lar esa shundoq yonida. Ishoq aka ashoblari bilan san’at haqida gaplashdi.";

const targets = [
    { value: 'yangi', label: 'Yangi alifbo' },
    { value: 'kirill', label: 'Kirill' },
] as const;

const emptyLexicon: Lexicon = new Map();

/** Landingdagi jonli namoyish: amaldagi lotin matni yangi alifbo yoki kirillga o'giriladi. */
const AlphabetSection: React.FC = () => {
    const [text, setText] = useState(SAMPLE);
    const [target, setTarget] = useState<'yangi' | 'kirill'>('yangi');
    const [lexicon, setLexicon] = useState<Lexicon>(emptyLexicon);

    useEffect(() => {
        // Lug'at sahifa yuklanib bo'lgach olinadi — birinchi ekran tezligiga ta'sir qilmaydi.
        const timer = setTimeout(() => loadLexicon().then(setLexicon, () => undefined), 1500);
        return () => clearTimeout(timer);
    }, []);

    const output = useMemo(() => transliterate(text, 'lotin', target, lexicon), [text, target, lexicon]);

    return (
        <section id="yangi-alifbo" className="relative overflow-hidden bg-surface py-20 md:py-24">
            <div aria-hidden className="absolute inset-0 bg-grid-pattern" />
            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
                <Reveal>
                    <SectionHeading
                        align="left"
                        eyebrow="Yangi özbek alifbosi"
                        title="Yangi alifboga"
                        accent="tayyormisiz?"
                        description="Oʻ, Gʻ, Sh va Ch örniga Ö, Ğ, Ş va Ç keladi, «ng» esa alohida harf sifatida çiqariladi. Matningizni yozing — Imlo Go uni darhol yangi alifboga yoki kirillga ögiradi."
                    />
                    <ul className="mt-8 grid grid-cols-2 gap-3 font-mono text-base sm:max-w-md">
                        {[
                            ['Oʻ oʻ', 'Ö ö'],
                            ['Gʻ gʻ', 'Ğ ğ'],
                            ['Sh sh', 'Ş ş'],
                            ['Ch ch', 'Ç ç'],
                        ].map(([before, after]) => (
                            <li key={before} className="rounded-xl border border-line bg-white px-4 py-3 text-center">
                                <span className="text-muted">{before}</span>
                                <span className="mx-2 text-primary">→</span>
                                <span className="font-semibold">{after}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                        <Button href="/app/translator" size="lg">
                            Translatorni oçiş
                            <LuArrowRight size={18} aria-hidden />
                        </Button>
                        <Button href="/qollanma/yangi-alifbo" variant="outline" size="lg">
                            Batafsil
                        </Button>
                    </div>
                </Reveal>

                <Reveal delay={0.1}>
                    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-glow-card">
                        <div className="border-b border-line p-5">
                            <label htmlFor="alphabet-demo" className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                                Amaldagi lotin
                            </label>
                            <textarea
                                id="alphabet-demo"
                                value={text}
                                onChange={event => setText(event.target.value.slice(0, 600))}
                                rows={4}
                                spellCheck={false}
                                className="mt-2 w-full resize-none bg-transparent text-lg leading-relaxed caret-primary !outline-none"
                            />
                        </div>
                        <div className="bg-surface p-5">
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">Natija</span>
                                <div className="flex rounded-full border border-line bg-white p-1">
                                    {targets.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            aria-pressed={target === option.value}
                                            onClick={() => setTarget(option.value)}
                                            className={clsx(
                                                'rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-all',
                                                target === option.value ? 'bg-brand-gradient text-white shadow-glow' : 'text-muted hover:text-primary'
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p aria-live="polite" className="mt-3 min-h-[7rem] whitespace-pre-wrap text-lg leading-relaxed">
                                {output}
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

export default AlphabetSection;
