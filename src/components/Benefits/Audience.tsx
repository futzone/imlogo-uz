import Card from '../ui/Card';
import IconNode from '../ui/IconNode';
import PhoneShot from '../ui/PhoneShot';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import { IBenefit } from '@/types';

/** "Bu kimlar uchun?" */
const Audience: React.FC<{ benefit: IBenefit }> = ({ benefit }) => {
    return (
        <section id="kimlar-uchun" className="relative overflow-hidden bg-surface py-20 md:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-20">
                <Reveal className="order-2 lg:order-1">
                    <PhoneShot src={benefit.imageSrc} alt="Imlo Go mobil ilovasi: diktant yoziş sahifasi" />
                </Reveal>

                <div className="order-1 lg:order-2">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Foydalanuvçilar"
                            title="Bu"
                            accent="kimlar uçun?"
                            description={benefit.description}
                            align="left"
                        />
                    </Reveal>

                    <div className="mt-10 grid gap-6">
                        {benefit.bullets.map((item, index) => (
                            <Reveal key={item.title} delay={index * 0.1}>
                                <Card className="!p-6">
                                    <div className="flex items-start gap-4">
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
            </div>
        </section>
    );
};

export default Audience;
