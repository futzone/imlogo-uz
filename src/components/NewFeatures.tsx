import Link from 'next/link';
import clsx from 'clsx';
import { LuArrowUpRight } from 'react-icons/lu';

import IconNode from './ui/IconNode';
import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';
import { newFeatures } from '@/data/features';

/** "Yangi imkoniyatlar": translator, uch yozuvli tez yozish, hamjamiyat va hisob — bento to'r. */
const NewFeatures: React.FC = () => (
    <section id="yangi-imkoniyatlar" className="relative bg-background py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5">
            <Reveal>
                <SectionHeading
                    eyebrow="Yangi imkoniyatlar"
                    title="Diktantdan ham"
                    accent="köproği"
                    description="Imlo Go endi özbek tili bilan işlaş uçun töliq platforma: yangi alifboga ötiş, tez yoziş, musobaqa va natijalarni kuzatiş — barçasi bitta joyda va bepul."
                />
            </Reveal>

            <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
                {newFeatures.map((feature, index) => (
                    <Reveal key={feature.title} delay={(index % 3) * 0.08} className={clsx('h-full', feature.wide && 'md:col-span-2')}>
                        <Link
                            href={feature.href}
                            className={clsx(
                                'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow-card md:p-7',
                                feature.wide ? 'bg-[#14101f] text-white' : 'bg-white'
                            )}
                        >
                            {feature.wide && (
                                <>
                                    <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary opacity-50 blur-[90px]" />
                                    <div aria-hidden className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-secondary opacity-30 blur-[90px]" />
                                </>
                            )}
                            <div className="relative flex items-start justify-between gap-4">
                                <IconNode className={feature.wide ? '!border-white/20 !bg-white/10 !text-white' : undefined}>
                                    {feature.icon}
                                </IconNode>
                                {feature.tag && (
                                    <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest">
                                        {feature.tag}
                                    </span>
                                )}
                            </div>
                            <h3 className={clsx('relative mt-5 font-semibold', feature.wide ? 'text-2xl md:text-3xl' : 'text-xl')}>
                                {feature.title}
                            </h3>
                            <p className={clsx('relative mt-2 flex-1 text-[15px] leading-relaxed', feature.wide ? 'max-w-xl text-white/75' : 'text-muted')}>
                                {feature.description}
                            </p>
                            {feature.wide && (
                                <p className="relative mt-6 flex flex-wrap gap-2 font-mono text-sm">
                                    {['Oʻ → Ö', 'Gʻ → Ğ', 'Sh → Ş', 'Ch → Ç'].map(change => (
                                        <span key={change} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5">
                                            {change}
                                        </span>
                                    ))}
                                </p>
                            )}
                            <span
                                className={clsx(
                                    'relative mt-5 inline-flex items-center gap-1 font-mono text-xs font-medium uppercase tracking-widest',
                                    feature.wide ? 'text-white' : 'text-primary'
                                )}
                            >
                                Oçiş
                                <LuArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                            </span>
                        </Link>
                    </Reveal>
                ))}
            </div>
        </div>
    </section>
);

export default NewFeatures;
