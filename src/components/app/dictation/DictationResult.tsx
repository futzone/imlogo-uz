'use client';

import { useEffect, useState } from 'react';
import { LuHome, LuInbox } from 'react-icons/lu';

import Badge from '@/components/ui/Badge';
import { rateColor } from '@/lib/app/format';
import { loadWork } from '@/lib/app/storage';
import { DetectedError, errorTypeNames, Work } from '@/lib/app/types';
import PageScaffold from '../PageScaffold';
import { AppButton, cardClass, CornerAccents, EmptyState, Spinner, StatTile } from '../ui';

interface Props {
    id: string;
    /** Natijalar tarixidan ochilgan — "orqaga" tarixga qaytaradi. */
    fromHistory: boolean;
}

/** Diktant natijasi: baho, ball, xatolar soni va xatolar ro'yxati. */
const DictationResult: React.FC<Props> = ({ id, fromHistory }) => {
    // `undefined` — hali o'qilmagan, `null` — topilmadi.
    const [work, setWork] = useState<Work | null | undefined>(undefined);

    useEffect(() => setWork(loadWork(id)), [id]);

    const tileClass = 'w-auto sm:w-[190px]';

    return (
        <PageScaffold title="Natija" backHref={fromHistory ? '/app/natijalar' : '/app'}>
            {work === undefined ? (
                <Spinner className="flex-1" />
            ) : work === null ? (
                <EmptyState icon={<LuInbox aria-hidden />} text="Bu diktant bo‘yicha natija topilmadi">
                    <AppButton variant="outline" href="/app">
                        Bosh sahifaga
                    </AppButton>
                </EmptyState>
            ) : (
                <>
                    <div className={`${cardClass} relative flex items-center gap-4 bg-white/85 p-5`}>
                        <CornerAccents />
                        <div className="min-w-0 flex-1">
                            <Badge>Diktant natijasi</Badge>
                            <h2 className="mt-3 text-[22px] font-bold xl:text-[28px]">{work.text.title}</h2>
                            <p className="mt-2 text-[15px] text-muted">
                                Ball: <span className="font-mono text-base font-medium text-foreground">{work.ball.toFixed(1)}</span>
                            </p>
                        </div>
                        <div className="shrink-0 text-center">
                            <p
                                className="font-mono text-5xl font-medium leading-none sm:text-[64px]"
                                style={{ color: rateColor(work.baho) }}
                            >
                                {work.baho.toFixed(1)}
                            </p>
                            <p className="mt-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                                Baho
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                        <StatTile className={tileClass} label="Imloviy xatoliklar" value={`${work.imloErrorCount} ta`} />
                        <StatTile
                            className={tileClass}
                            label="Punktuatsion xatoliklar"
                            value={`${work.punktuatsionErrorCount} ta`}
                        />
                        <StatTile className={tileClass} label="Uslubiy xatoliklar" value={`${work.uslubiyErrorCount} ta`} />
                        <StatTile className={tileClass} label="Grafik xatoliklar" value={`${work.grafikErrorCount} ta`} />
                    </div>

                    {work.errors.length > 0 && (
                        <>
                            <h2 className="mb-3 mt-7 text-xl font-semibold">Xatoliklar</h2>
                            {work.errors.map((error, i) => (
                                <ErrorCard key={i} error={error} />
                            ))}
                        </>
                    )}

                    <div className="mt-6 flex justify-center">
                        <AppButton href="/app" icon={<LuHome size={20} aria-hidden />}>
                            Bosh sahifaga
                        </AppButton>
                    </div>
                </>
            )}
        </PageScaffold>
    );
};

const ErrorCard: React.FC<{ error: DetectedError }> = ({ error }) => {
    const rows = [
        { label: 'Aslida:', value: error.originalFragment, className: 'text-success' },
        { label: 'Siz kiritgan:', value: error.userFragment, className: 'text-danger' },
        { label: 'Xatolik turi:', value: errorTypeNames[error.type], className: 'text-primary' },
        { label: 'Xatolik:', value: error.description, className: 'text-foreground' },
    ];

    return (
        <dl className="mb-2.5 rounded-xl border border-line bg-surface p-3.5">
            {rows.map(row => (
                <div key={row.label} className="flex items-start py-[3px]">
                    <dt className="w-[104px] shrink-0 text-[13px] text-muted">{row.label}</dt>
                    <dd className={`min-w-0 flex-1 break-words text-sm font-semibold ${row.className}`}>{row.value}</dd>
                </div>
            ))}
        </dl>
    );
};

export default DictationResult;
