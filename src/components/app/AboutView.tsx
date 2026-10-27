'use client';

import { useEffect, useState } from 'react';
import { FaTelegramPlane } from 'react-icons/fa';
import { LuCode2, LuFileText, LuGlobe, LuMail } from 'react-icons/lu';

import { fetchAppInfo } from '@/lib/app/pocketbase';
import { AppInfo } from '@/lib/app/types';
import DashboardPage from './DashboardPage';
import { AppButton, cardClass, Spinner } from './ui';

const APP_VERSION = 'Imlo Go v1.2.0';
const CONTACT_EMAIL = 'abdumalikovagulshoda2403@gmail.com';

/** "Loyiha haqida": tavsif (serverdan), litsenziya va havolalar. */
const AboutView: React.FC = () => {
    const [info, setInfo] = useState<AppInfo | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetchAppInfo()
            .then(result => !cancelled && setInfo(result))
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, []);

    const links = info
        ? [
              { url: info.telegram, label: 'Telegram Kanal', icon: <FaTelegramPlane size={20} aria-hidden /> },
              { url: info.website, label: 'ImloGo.uz', icon: <LuGlobe size={20} aria-hidden /> },
              { url: info.github, label: 'GitHub', icon: <LuCode2 size={20} aria-hidden /> },
              { url: '/qollanma', label: 'Qöllanma', icon: <LuFileText size={20} aria-hidden /> },
              { url: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL, icon: <LuMail size={20} aria-hidden /> },
          ].filter((link): link is typeof link & { url: string } => link.url !== null)
        : [];

    return (
        <DashboardPage title="Imlo Go haqida" subtitle="Özbek tili imlosi uçun oçiq va bepul platforma.">
            <div className={`${cardClass} mt-6 p-6 text-[15px] sm:p-8`}>
                {failed ? (
                    <p className="text-center text-sm text-muted">Ma’lumotlarni yuklaşda xatolik</p>
                ) : !info ? (
                    <Spinner className="p-8" />
                ) : (
                    <>
                        <p className="whitespace-pre-line leading-relaxed">{info.about}</p>
                        {info.license && <p className="mt-3 text-sm text-muted">{info.license}</p>}
                        {info.telegram && (
                            <p className="mt-6 text-sm text-muted">
                                Loyihaga oid yangiliklardan doimiy xabardor böliş uçun bizning Imlo Go Telegram
                                kanaliga a’zo böling 👇
                            </p>
                        )}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {links.map(link => (
                                <AppButton key={link.label} variant="outline" expand href={link.url} icon={link.icon}>
                                    {link.label}
                                </AppButton>
                            ))}
                        </div>
                        <p className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                            {APP_VERSION}
                        </p>
                    </>
                )}
            </div>
        </DashboardPage>
    );
};

export default AboutView;
