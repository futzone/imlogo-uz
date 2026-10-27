'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LuArrowRight, LuLanguages } from 'react-icons/lu';

import AppStoreButton from './AppStoreButton';
import PlayStoreButton from './PlayStoreButton';
import WindowsButton from './WindowsButton';
import Badge from './ui/Badge';
import CelebrationBadge from './celebration/CelebrationBadge';
import CelebrationBanner from './celebration/CelebrationBanner';
import Button from './ui/Button';
import { heroDetails } from '@/data/hero';
import { stats } from '@/data/stats';

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: 'easeOut' },
});

// Skrinshot atrofida suzuvchi statistik kartalarning joylashuvi
const floatingCards = [
    'left-0 top-[12%] lg:-left-10 animate-float',
    'right-0 top-[38%] lg:-right-12 animate-float-slow',
    'left-[4%] bottom-[10%] lg:-left-4 animate-float-slow',
];

const Hero: React.FC = () => {
    return (
        <section
            id="hero"
            className="relative overflow-hidden px-5 pb-10 pt-32 md:pt-44"
        >
            {/* Iliq gradient fon — binafsha (yuqori-chap) → sarg'ish */}
            <div className="absolute inset-0 -z-20 hero-gradient" />
            {/* Katak naqsh */}
            <div className="absolute inset-0 -z-10 bg-grid-pattern" />
            {/* Pastga qarab oq rangga o'tish */}
            <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background" />

            <div className="relative mx-auto max-w-7xl text-center">
                <motion.div {...fadeUp(0)}>
                    <CelebrationBanner className="mx-auto mb-8 max-w-3xl" />
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <CelebrationBadge />
                        <Badge pulse>{heroDetails.badge}</Badge>
                    </div>
                </motion.div>

                <motion.h1
                    className="mx-auto mt-6 max-w-5xl text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-7xl"
                    {...fadeUp(0.1)}
                >
                    {heroDetails.heading}{' '}
                    <span className="text-gradient">{heroDetails.headingAccent}</span>
                </motion.h1>

                <motion.p
                    className="mx-auto mt-6 max-w-2xl text-base text-muted md:text-lg"
                    {...fadeUp(0.2)}
                >
                    {heroDetails.subheading}
                </motion.p>

                <motion.div className="mt-8 flex flex-wrap justify-center gap-3" {...fadeUp(0.3)}>
                    <Button href={heroDetails.appUrl} size="lg">
                        Brauzerda sinab köriş
                        <LuArrowRight size={18} aria-hidden />
                    </Button>
                    <Button href={heroDetails.translatorUrl} variant="outline" size="lg">
                        <LuLanguages size={18} aria-hidden />
                        Yangi alifbo translatori
                    </Button>
                </motion.div>

                <motion.div
                    className="mx-auto mt-6 flex w-full max-w-xs flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4"
                    {...fadeUp(0.4)}
                >
                    <AppStoreButton dark />
                    <PlayStoreButton dark />
                    <WindowsButton dark />
                </motion.div>

                {/* Ilova skrinshoti: orbital halqalar va suzuvchi kartalar bilan */}
                <motion.div
                    className="relative mx-auto mt-14 max-w-5xl md:mt-20"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
                >
                    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                        <div className="absolute h-[70%] w-[70%] rounded-full bg-primary opacity-20 blur-[120px]" />
                        <div className="absolute aspect-square h-[115%] rounded-full border border-dashed border-primary/30 animate-spin-slow" />
                        <div className="absolute aspect-square h-[85%] rounded-full border border-secondary/20 animate-spin-slower">
                            <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-secondary shadow-glow-lg" />
                        </div>
                    </div>

                    <Image
                        src={heroDetails.centerImageSrc}
                        width={1100}
                        height={715}
                        quality={100}
                        sizes="(max-width: 768px) 100vw, 1000px"
                        priority={true}
                        unoptimized={true}
                        alt="Imlo Go ilovasining boş sahifasi: diktantlar röyxati"
                        className="mx-auto w-full"
                    />

                    {stats.map((stat, index) => (
                        <div
                            key={stat.title}
                            className={`glass absolute hidden items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-glow-soft md:flex ${floatingCards[index]}`}
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                                {stat.icon}
                            </span>
                            <span>
                                <span className="block font-mono text-xl font-medium leading-none text-foreground">
                                    {stat.title}
                                </span>
                                <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-muted">
                                    {stat.label}
                                </span>
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
