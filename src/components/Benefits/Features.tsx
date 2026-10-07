import React from 'react';

import Card from '../ui/Card';
import IconNode from '../ui/IconNode';
import PhoneShot from '../ui/PhoneShot';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import { IBenefit } from '@/types';

/** "Asosiy imkoniyatlar" — fonida katta ikonka-suvbelgisi bo'lgan kartalar */
const Features: React.FC<{ benefit: IBenefit }> = ({ benefit }) => {
    return (
        <section id="imkoniyatlar" className="relative overflow-hidden bg-surface py-20 md:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-20">
                <div>
                    <Reveal>
                        <SectionHeading
                            eyebrow="Imkoniyatlar"
                            title="Asosiy"
                            accent="imkoniyatlar"
                            description={benefit.description}
                            align="left"
                        />
                    </Reveal>

                    <div className="mt-10 grid gap-6">
                        {benefit.bullets.map((item, index) => (
                            <Reveal key={item.title} delay={index * 0.1}>
                                <Card className="overflow-hidden !p-6">
                                    <span
                                        aria-hidden
                                        className="pointer-events-none absolute -bottom-6 -right-4 rotate-12 text-primary opacity-[0.07] transition-opacity duration-300 group-hover:opacity-20"
                                    >
                                        {React.cloneElement(item.icon, { size: 120 })}
                                    </span>
                                    <div className="relative flex items-start gap-4">
                                        <IconNode>{item.icon}</IconNode>
                                        <div>
                                            <h3 className="text-xl font-semibold">{item.title}</h3>
                                            <p className="mt-1 text-base text-muted">{item.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Reveal>
                        ))}
                    </div>
                </div>

                <Reveal>
                    <PhoneShot src={benefit.imageSrc} alt="Imlo Go mobil ilovasi: «Mening natijalarim» sahifasi" />
                </Reveal>
            </div>
        </section>
    );
};

export default Features;
