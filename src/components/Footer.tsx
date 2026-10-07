import Link from 'next/link';
import React from 'react';
import { LuBug, LuMail } from 'react-icons/lu';

import Logo from './Logo';
import { siteDetails } from '@/data/siteDetails';
import { footerDetails } from '@/data/footer';

const Footer: React.FC = () => {
    const [emailName, emailDomain] = footerDetails.email.split('@');

    return (
        <footer className="border-t border-line bg-surface text-foreground">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-5 py-14 md:grid-cols-[minmax(0,2fr)_auto_auto] md:gap-x-16">
                <div>
                    <Link href="/" className="flex w-fit items-center" aria-label={`${siteDetails.siteName} — bosh sahifa`}>
                        <Logo className="h-8" />
                    </Link>
                    <p className="mt-4 max-w-xl text-base text-muted">
                        {footerDetails.subheading}
                    </p>
                </div>
                <div>
                    <h4 className="mb-4 font-mono text-xs font-medium uppercase tracking-widest text-primary">Havolalar</h4>
                    <ul className="space-y-1 text-base text-muted">
                        {footerDetails.quickLinks.map(link => (
                            <li key={link.text}>
                                <Link href={link.url} className="inline-flex min-h-[32px] items-center transition-colors duration-200 hover:text-primary">{link.text}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="mb-4 font-mono text-xs font-medium uppercase tracking-widest text-primary">Aloqa uchun</h4>

                    {footerDetails.email && (
                        <a
                            href={`mailto:${footerDetails.email}`}
                            className="flex w-fit max-w-full items-start gap-2 text-base text-muted transition-colors duration-200 hover:text-primary"
                        >
                            <LuMail size={18} className="mt-1 shrink-0" aria-hidden />
                            {/* Faqat "@" oldidan sinadi — manzil so'z o'rtasidan bo'linib ketmaydi */}
                            <span className="min-w-0">
                                {emailName}
                                <wbr />@{emailDomain}
                            </span>
                        </a>
                    )}

                    {footerDetails.telegram && (
                        <a
                            href={footerDetails.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex min-h-[32px] w-fit items-center gap-2 text-base font-medium text-primary underline-offset-4 transition-colors duration-200 hover:underline"
                        >
                            <LuBug size={18} className="shrink-0" aria-hidden />
                            Xatolik bormi?
                        </a>
                    )}
                </div>
            </div>
            <div className="border-t border-line">
                <p className="mx-auto max-w-7xl px-5 py-6 font-mono text-xs text-muted md:text-center">
                    &copy; {new Date().getFullYear()} {siteDetails.siteName}. Barcha huquqlar himoyalangan.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
