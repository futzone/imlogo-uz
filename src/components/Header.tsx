'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Transition } from '@headlessui/react';
import { HiOutlineXMark, HiBars3 } from 'react-icons/hi2';
import Image from 'next/image';
import { menuItems } from '@/data/menuItems';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full">
            {/* Desktop - pill shaped navbar */}
            <div className="hidden md:block max-w-5xl mx-auto mt-4 px-5">
                <nav className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-full flex justify-between items-center py-2.5 px-6 shadow-sm">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/images/text-logo.png"
                            alt="Logo"
                            width={100}
                            height={28}
                            priority
                        />
                    </Link>

                    <ul className="flex items-center gap-6">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link href={item.url} className="text-sm font-medium text-foreground hover:text-primary transition-colors uppercase tracking-wide">
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="https://app.imlogo.uz" className="text-sm font-semibold text-white bg-primary hover:bg-primary-accent px-6 py-2 rounded-full transition-colors uppercase tracking-wide">
                                Sinab ko&apos;rish
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Mobile navbar */}
            <nav className="md:hidden bg-white shadow-md flex justify-between items-center py-2.5 px-5">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/images/text-logo.png"
                        alt="Logo"
                        width={100}
                        height={28}
                        priority
                    />
                </Link>
                <button
                    onClick={toggleMenu}
                    type="button"
                    className="bg-primary text-white focus:outline-none rounded-full w-10 h-10 flex items-center justify-center"
                    aria-controls="mobile-menu"
                    aria-expanded={isOpen}
                >
                    {isOpen ? (
                        <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                    ) : (
                        <HiBars3 className="h-6 w-6" aria-hidden="true" />
                    )}
                    <span className="sr-only">Navigatsiya</span>
                </button>
            </nav>

            {/* Mobile Menu */}
            <Transition
                show={isOpen}
                enter="transition ease-out duration-200 transform"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75 transform"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div id="mobile-menu" className="md:hidden bg-white shadow-lg">
                    <ul className="flex flex-col space-y-4 pt-1 pb-6 px-6">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link href={item.url} className="text-foreground hover:text-primary block" onClick={toggleMenu}>
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="https://app.imlogo.uz" className="text-white bg-primary hover:bg-primary-accent px-5 py-2 rounded-full block w-fit" onClick={toggleMenu}>
                                Sinab ko&apos;rish
                            </Link>
                        </li>
                    </ul>
                </div>
            </Transition>
        </header>
    );
};

export default Header;
