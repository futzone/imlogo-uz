'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Transition } from '@headlessui/react';
import { LuMenu, LuX } from 'react-icons/lu';

import Logo from './Logo';
import Button from './ui/Button';
import { menuItems } from '@/data/menuItems';
import { heroDetails } from '@/data/hero';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full">
            <div className="max-w-5xl mx-auto mt-3 md:mt-4 px-4 md:px-5">
                {/* Pill shaklidagi shisha navbar */}
                <nav className="glass rounded-full flex justify-between items-center py-2 pl-5 pr-2 md:pl-6 shadow-glow-soft">
                    <Link href="/" className="flex items-center" aria-label="Imlo Go — boş sahifa">
                        <Logo className="h-[19px] md:h-[22px]" />
                    </Link>

                    <ul className="hidden md:flex items-center gap-6">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link
                                    href={item.url}
                                    className="font-mono text-xs font-medium text-muted hover:text-primary transition-colors duration-200 uppercase tracking-wider"
                                >
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-2">
                        <Button href={heroDetails.appUrl} size="sm">
                            Sinab köriş
                        </Button>
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="md:hidden flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? (
                                <LuX className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <LuMenu className="h-6 w-6" aria-hidden="true" />
                            )}
                            <span className="sr-only">Navigatsiya</span>
                        </button>
                    </div>
                </nav>

                {/* Mobil menyu */}
                <Transition
                    show={isOpen}
                    enter="transition ease-out duration-200 transform"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-75 transform"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div id="mobile-menu" className="md:hidden glass !bg-white/95 mt-2 rounded-2xl shadow-glow-soft">
                        <ul className="flex flex-col p-3">
                            {menuItems.map(item => (
                                <li key={item.text}>
                                    <Link
                                        href={item.url}
                                        className="flex min-h-[44px] items-center rounded-xl px-4 font-mono text-sm uppercase tracking-wider text-foreground hover:bg-primary/10 hover:text-primary"
                                        onClick={toggleMenu}
                                    >
                                        {item.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Transition>
            </div>
        </header>
    );
};

export default Header;
