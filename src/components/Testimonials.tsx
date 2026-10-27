import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { LuQuote } from 'react-icons/lu';

import Card from './ui/Card';
import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';
import { testimonials } from '@/data/testimonials';

const Testimonials: React.FC = () => {
    return (
        <section id="testimonials" className="relative overflow-hidden bg-background py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-5">
                <Reveal>
                    <SectionHeading
                        eyebrow="Fikrlar"
                        title="Foydalanuvçilarning"
                        accent="fikrlari"
                        description="«Imlo Go» foydalanuvçilarining fikrlari bilan tanişib çiqing."
                    />
                </Reveal>
            </div>

            {/* Kartalar sig'maydi — ikki nusxadagi lenta cheksiz aylanadi; ustiga kelinganda to'xtaydi. */}
            <Reveal delay={0.1}>
                <div className="group mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] motion-reduce:overflow-x-auto">
                    <ul className="flex w-max motion-safe:animate-marquee group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]">
                        {[...testimonials, ...testimonials].map((testimonial, index) => {
                            const copy = index >= testimonials.length;
                            return (
                                <li
                                    key={`${testimonial.name}-${index}`}
                                    aria-hidden={copy || undefined}
                                    className={clsx('flex w-[300px] shrink-0 pl-6 sm:w-[380px]', copy && 'motion-reduce:hidden')}
                                >
                                    <Card className="flex w-full flex-col">
                                        <LuQuote aria-hidden size={28} className="text-primary/40" />
                                        <p className="mt-4 flex-1 text-base text-foreground-accent">{testimonial.message}</p>
                                        <div className="mt-6 flex items-center gap-4 border-t border-line pt-6">
                                            <Image
                                                src={testimonial.avatar}
                                                alt={copy ? '' : testimonial.name}
                                                width={48}
                                                height={48}
                                                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
                                            />
                                            <div className="min-w-0">
                                                <h3 className="font-heading text-base font-semibold">{testimonial.name}</h3>
                                                <p className="mt-1 font-mono text-[11px] uppercase leading-snug tracking-wider text-muted">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </Reveal>
        </section>
    );
};

export default Testimonials;
