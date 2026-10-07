import { LuArrowRight } from 'react-icons/lu';

import TypingDemo from './TypingDemo';
import Button from '../ui/Button';
import Card from '../ui/Card';
import GlowBlob from '../ui/GlowBlob';
import IconNode from '../ui/IconNode';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import { typingDetails } from '@/data/typing';

/** Yangi modul: o'zbekcha so'zlarda tez yozish mashqi */
const TypingSection: React.FC = () => {
    return (
        <section id="tez-yozish" className="relative overflow-hidden bg-background py-20 md:py-24">
            <div aria-hidden className="absolute inset-0 bg-grid-pattern" />
            <GlowBlob className="left-[10%] top-10 h-72 w-72 bg-primary opacity-15" />
            <GlowBlob className="bottom-0 right-[8%] h-72 w-72 bg-secondary opacity-10" />

            <div className="relative mx-auto max-w-7xl px-5">
                <Reveal>
                    <SectionHeading
                        eyebrow={typingDetails.eyebrow}
                        title={typingDetails.title}
                        accent={typingDetails.accent}
                        description={typingDetails.description}
                    />
                </Reveal>

                <Reveal className="mx-auto mt-12 max-w-4xl">
                    <TypingDemo />
                </Reveal>

                <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
                    {typingDetails.bullets.map((item, index) => (
                        <Reveal key={item.title} delay={index * 0.1} className="h-full">
                            <Card glass corners className="h-full !p-6">
                                <IconNode>{item.icon}</IconNode>
                                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                                <p className="mt-2 text-base text-muted">{item.description}</p>
                            </Card>
                        </Reveal>
                    ))}
                </div>

                <Reveal className="mt-10 flex justify-center">
                    <Button href={typingDetails.appUrl} size="lg">
                        Ilovada to‘liq mashq qilish
                        <LuArrowRight size={18} aria-hidden />
                    </Button>
                </Reveal>
            </div>
        </section>
    );
};

export default TypingSection;
