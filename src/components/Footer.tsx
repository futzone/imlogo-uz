import Link from 'next/link';
import React from 'react';
import { FaTelegramPlane } from 'react-icons/fa';
import { LuBug } from 'react-icons/lu';

import Logo from './Logo';
import AppStoreButton from './AppStoreButton';
import PlayStoreButton from './PlayStoreButton';
import WindowsButton from './WindowsButton';
import { siteDetails } from '@/data/siteDetails';
import { footerDetails } from '@/data/footer';

const headingClass = 'mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-primary';
const linkClass = 'inline-flex min-h-[32px] items-center text-[15px] text-muted transition-colors duration-200 hover:text-primary';

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-line bg-surface text-foreground">
            <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-12 pt-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]">
                <div className="max-w-md">
                    <Link href="/" className="flex w-fit items-center" aria-label={`${siteDetails.siteName} — boş sahifa`}>
                        <Logo className="h-[26px]" />
                    </Link>
                    <p className="mt-4 text-[15px] leading-relaxed text-muted">{footerDetails.description}</p>

                    <div className="mt-6 flex flex-col gap-2.5">
                        <a href={footerDetails.telegramChannel} target="_blank" rel="noopener noreferrer" className={`${linkClass} gap-2`}>
                            <FaTelegramPlane size={18} className="shrink-0" aria-hidden />
                            Telegram kanal — @imlogo
                        </a>
                        <a
                            href={footerDetails.telegramBot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${linkClass} gap-2 font-medium !text-primary hover:underline`}
                        >
                            <LuBug size={18} className="shrink-0" aria-hidden />
                            Xatolik topdingizmi? Xabar bering
                        </a>
                    </div>
                </div>

                <nav aria-label="Sayt xaritasi" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
                    {footerDetails.columns.map(column => (
                        <div key={column.title}>
                            <h2 className={headingClass}>{column.title}</h2>
                            <ul>
                                {column.links.map(link => (
                                    <li key={link.url}>
                                        <Link href={link.url} className={linkClass}>
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="mx-auto max-w-7xl px-5 pb-10">
                <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-heading text-base font-semibold">Imlo Go istalgan qurilmada</p>
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <AppStoreButton dark />
                        <PlayStoreButton dark />
                        <WindowsButton dark />
                    </div>
                </div>
            </div>

            <div className="border-t border-line">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 md:flex-row md:items-start md:justify-between md:gap-10">
                    <p className="shrink-0 font-mono text-xs text-muted">
                        &copy; {new Date().getFullYear()} {siteDetails.siteName}. Barça huquqlar himoyalangan.
                    </p>
                    <p className="max-w-2xl text-xs leading-relaxed text-muted md:text-right">{footerDetails.credit}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
