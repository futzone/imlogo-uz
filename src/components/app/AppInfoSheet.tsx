'use client';

import { useEffect, useState } from 'react';
import { FaTelegramPlane } from 'react-icons/fa';
import { LuCode2, LuFileText, LuGlobe } from 'react-icons/lu';

import { fetchAppInfo } from '@/lib/app/pocketbase';
import { AppInfo } from '@/lib/app/types';
import { Sheet } from './Overlay';
import { AppButton, Spinner } from './ui';

const APP_VERSION = 'Imlo Go v1.1.0';

const AppInfoSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const [info, setInfo] = useState<AppInfo | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!open || info) return;
        let cancelled = false;
        setFailed(false);
        fetchAppInfo()
            .then(result => !cancelled && setInfo(result))
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, [open, info]);

    const links = info
        ? [
              { url: info.telegram, label: 'Telegram Kanal', icon: <FaTelegramPlane size={20} aria-hidden /> },
              { url: info.website, label: 'ImloGo.uz', icon: <LuGlobe size={20} aria-hidden /> },
              { url: info.github, label: 'GitHub', icon: <LuCode2 size={20} aria-hidden /> },
              { url: info.docs, label: 'Hujjatlar', icon: <LuFileText size={20} aria-hidden /> },
          ].filter((link): link is typeof link & { url: string } => link.url !== null)
        : [];

    return (
        <Sheet open={open} onClose={onClose} title="Imlo Go haqida">
            {failed ? (
                <p className="p-6 text-center text-sm text-muted">Ma’lumotlarni yuklashda xatolik</p>
            ) : !info ? (
                <Spinner className="p-8" />
            ) : (
                <div className="text-center text-sm">
                    <p>{info.about}</p>
                    {info.license && <p className="mt-2 text-muted">{info.license}</p>}
                    {links.length > 0 && (
                        <>
                            <hr className="my-5 border-line" />
                            {info.telegram && (
                                <p className="mb-4 text-muted">
                                    Loyihaga oid yangiliklardan doimiy xabardor bo‘lish uchun bizning Imlo Go Telegram
                                    kanaliga a’zo bo‘ling 👇
                                </p>
                            )}
                            <div className="flex flex-col gap-3">
                                {links.map(link => (
                                    <AppButton key={link.label} variant="outline" expand href={link.url} icon={link.icon}>
                                        {link.label}
                                    </AppButton>
                                ))}
                            </div>
                        </>
                    )}
                    <p className="mt-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                        {APP_VERSION}
                    </p>
                </div>
            )}
        </Sheet>
    );
};

export default AppInfoSheet;
