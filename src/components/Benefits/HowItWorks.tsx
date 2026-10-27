import Card from '../ui/Card';
import PhoneShot from '../ui/PhoneShot';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import { IBenefit } from '@/types';

/** "Qanday ishlaydi?" — raqamlangan tugunli vertikal zanjir (timeline) */
const HowItWorks: React.FC<{ benefit: IBenefit }> = ({ benefit }) => {
    return (
        <section id="features" className="relative overflow-hidden bg-background py-20 md:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-20">
                <Reveal className="order-2 lg:order-1">
                    <PhoneShot src={benefit.imageSrc} alt="Imlo Go mobil ilovasi: diktantlar röyxati" />
                </Reveal>

                <div className="order-1 lg:order-2">
                    <Reveal>
                        <SectionHeading
                            eyebrow="3 qadam"
                            title="Diktant yoziş"
                            accent="qanday işlaydi?"
                            description={benefit.description}
                            align="left"
                        />
                    </Reveal>

                    <ol className="relative mt-10 space-y-6">
                        {/* Zanjir chizig'i: binafshadan shaffofga */}
                        <span
                            aria-hidden
                            className="absolute bottom-0 left-6 top-6 w-px bg-gradient-to-b from-primary via-secondary/50 to-transparent"
                        />
                        {benefit.bullets.map((item, index) => (
                            <li key={item.title} className="relative pl-16 md:pl-20">
                                <span className="absolute left-0 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-primary bg-white font-mono text-sm font-medium text-primary shadow-glow">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <Reveal delay={index * 0.1}>
                                    <Card glass corners className="!p-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-primary">{item.icon}</span>
                                            <h3 className="text-xl font-semibold">{item.title}</h3>
                                        </div>
                                        <p className="mt-2 text-base text-muted">{item.description}</p>
                                    </Card>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
