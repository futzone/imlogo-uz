import React from 'react';
import Image from 'next/image';
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
                        title="Foydalanuvchilarning"
                        accent="fikrlari"
                        description="«Imlo Go» foydalanuvchilarining fikrlari bilan tanishib chiqing."
                    />
                </Reveal>

                <div className="mx-auto mt-12 grid max-w-lg gap-6 lg:max-w-full lg:grid-cols-3 lg:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Reveal key={testimonial.name} delay={index * 0.1} className="h-full">
                            <Card className="flex h-full flex-col">
                                <LuQuote aria-hidden size={28} className="text-primary/40" />
                                <p className="mt-4 flex-1 text-base text-foreground-accent">
                                    {testimonial.message}
                                </p>
                                <div className="mt-6 flex items-center gap-4 border-t border-line pt-6">
                                    <Image
                                        src={testimonial.avatar}
                                        alt={`${testimonial.name} avatar`}
                                        width={48}
                                        height={48}
                                        className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                                    />
                                    <div>
                                        <h3 className="font-heading text-base font-semibold">{testimonial.name}</h3>
                                        <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{testimonial.role}</p>
                                    </div>
                                </div>
                            </Card>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
