'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

import AppStoreButton from './AppStoreButton';
import PlayStoreButton from './PlayStoreButton';
import WindowsButton from './WindowsButton';
import { heroDetails } from '@/data/hero';

const Hero: React.FC = () => {
    return (
        <section
            id="hero"
            className="relative flex items-center justify-center pb-0 pt-36 md:pt-48 px-5 overflow-hidden min-h-[80vh]"
        >
            {/* Warm gradient background — purple top-left → cream/light */}
            <div className="absolute inset-0 -z-10 hero-gradient" />

            {/* Bottom fade to white */}
            <div className="absolute left-0 right-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white z-10" />

            {/* Content */}
            <div className="text-center relative z-20 max-w-5xl mx-auto">
                {/* Large bold heading */}
                <motion.h1
                    className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground leading-tight md:leading-tight lg:leading-tight max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    {heroDetails.heading}
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    className="mt-6 md:mt-8 text-foreground-accent max-w-2xl mx-auto text-lg md:text-xl leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                >
                    {heroDetails.subheading}
                </motion.p>

                {/* Download buttons */}
                <motion.div
                    className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center sm:gap-4 w-fit mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                >
                    <AppStoreButton dark />
                    <PlayStoreButton dark />
                    <WindowsButton dark />
                </motion.div>

                {/* App screenshot */}
                <motion.div
                    className="relative mt-16 md:mt-20"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
                >
                    <Image
                        src={heroDetails.centerImageSrc}
                        width={1100}
                        height={800}
                        quality={100}
                        sizes="(max-width: 768px) 100vw, 1000px"
                        priority={true}
                        unoptimized={true}
                        alt="app mockup"
                        className="w-full mx-auto"
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
