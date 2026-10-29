'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { LuArrowLeft, LuCalendar, LuHeadphones, LuKeyboard, LuTrophy, LuUserX } from 'react-icons/lu';

import { fetchProfile, ProfileDetails, PublicTypingResult } from '@/lib/app/account';
import { formatDate, rateColor } from '@/lib/app/format';
import { useAuth } from '../auth/AuthProvider';
import DashboardPage from '../DashboardPage';
import Avatar from '../shell/Avatar';
import { AppButton, cardClass, EmptyState, Spinner, StatTile } from '../ui';

/** Ping har 5 daqiqada yuboriladi — shundan yangiroq faollik "onlayn" hisoblanadi. */
const ONLINE_WINDOW_MS = 6 * 60 * 1000;

/** Oxirgi faollik: "Hozir onlayn", "12 daqiqa oldin", "kecha, 18:40" va h.k. */
export const formatLastSeen = (iso: string | null, now = Date.now()): string => {
    if (!iso) return 'Ma’lum emas';
    const time = new Date(iso).getTime();
    if (Number.isNaN(time)) return 'Ma’lum emas';
    const diff = now - time;
    if (diff < ONLINE_WINDOW_MS) return 'Hozir onlayn';
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} soat oldin`;
    const days = Math.floor(hours / 24);
    if (days === 1) return `keça, ${formatDate(iso).split(', ')[1]}`;
    if (days < 7) return `${days} kun oldin`;
    return formatDate(iso).split(',')[0];
};

const modeLabel = (result: PublicTypingResult) => {
    if (result.mode === 'time') return `${result.amount} soniya`;
    if (result.mode === 'sentences') return `${result.amount} ta gap`;
    return `${result.amount} ta söz`;
};

const num = (value: number | undefined) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

type State = { status: 'loading' } | { status: 'error' } | { status: 'missing' } | { status: 'ready'; details: ProfileDetails };

/** Boshqa foydalanuvchining ochiq profili: rasm, ism, faollik va natijalar. */
const PublicProfileView: React.FC<{ userId: string }> = ({ userId }) => {
    const { account } = useAuth();
    const [state, setState] = useState<State>({ status: 'loading' });
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        let cancelled = false;
        setState({ status: 'loading' });
        fetchProfile(userId)
            .then(details => !cancelled && setState(details ? { status: 'ready', details } : { status: 'missing' }))
            .catch(() => !cancelled && setState({ status: 'error' }));
        const timer = setInterval(() => setNow(Date.now()), 60_000);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [userId]);

    const back = (
        <AppButton variant="ghost" href="/app/hamjamiyat" icon={<LuArrowLeft size={18} aria-hidden />} className="!min-h-[40px]">
            Hamjamiyat
        </AppButton>
    );

    if (state.status === 'loading') return <Spinner className="flex-1" />;
    if (state.status !== 'ready') {
        return (
            <DashboardPage title="Profil" actions={back}>
                <EmptyState
                    icon={<LuUserX aria-hidden />}
                    tone={state.status === 'error' ? 'danger' : 'primary'}
                    text={
                        state.status === 'error'
                            ? 'Profilni yuklab bölmadi. Birozdan söng qayta urinib köring.'
                            : 'Bunday foydalanuvçi topilmadi.'
                    }
                />
            </DashboardPage>
        );
    }

    const { profile, typing, dictation, typingRank, dictationRank, bestTyping, recentDictations } = state.details;
    const lastSeen = formatLastSeen(profile.lastSeen, now);
    const online = lastSeen === 'Hozir onlayn';
    const isMe = account?.id === profile.id;

    return (
        <DashboardPage title="Profil" actions={back}>
            <section className={clsx(cardClass, 'mt-6 flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left')}>
                <div className="relative">
                    <Avatar account={profile} className="!h-24 !w-24 !text-4xl" />
                    {online && (
                        <span
                            className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-success"
                            aria-hidden
                        />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="break-words font-heading text-2xl font-bold">
                        {profile.name}
                        {isMe && <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">siz</span>}
                    </p>
                    <p className={clsx('mt-1 text-sm', online ? 'font-medium text-success' : 'text-muted')}>
                        {online ? 'Hozir onlayn' : `Oxirgi marta onlayn: ${lastSeen}`}
                    </p>
                    {profile.createdAt && (
                        <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted">
                            <LuCalendar size={12} aria-hidden />
                            A’zo bölgan: {formatDate(profile.createdAt).split(',')[0]}
                        </p>
                    )}
                </div>
                {isMe && (
                    <AppButton variant="outline" href="/app/profil" className="!min-h-[40px]">
                        Profilni tahrirlaş
                    </AppButton>
                )}
            </section>

            <section className="mt-6">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                    <LuKeyboard size={18} className="text-primary" aria-hidden />
                    Tez yoziş
                </h2>
                {typing ? (
                    <>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatTile className="w-auto" label="Eng yaxşi (WPM)" value={`${Math.round(num(typing.best_wpm))}`} valueClassName="text-primary" />
                            <StatTile className="w-auto" label="Örtaça (WPM)" value={`${Math.round(num(typing.avg_wpm))}`} />
                            <StatTile className="w-auto" label="Aniqlik" value={`${Math.round(num(typing.avg_accuracy))}%`} />
                            <StatTile className="w-auto" label="Reytingda" value={typingRank ? `${typingRank}-örin` : '—'} />
                        </div>
                        <p className="mt-2 font-mono text-[11px] text-muted">
                            {num(typing.games)} ta maşq · {Math.round(num(typing.total_seconds) / 60)} daqiqa
                        </p>
                        {bestTyping.length > 0 && (
                            <ul className={clsx(cardClass, 'mt-3 divide-y divide-line')}>
                                {bestTyping.map(result => (
                                    <li key={result.id} className="flex items-center gap-3 px-4 py-3">
                                        <LuTrophy size={16} className="shrink-0 text-primary/70" aria-hidden />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">{modeLabel(result)}</p>
                                            <p className="font-mono text-[11px] text-muted">
                                                {formatDate(result.createdAt)} · {Math.round(result.accuracy)}% aniqlik
                                            </p>
                                        </div>
                                        <span className="font-mono text-lg text-primary">{Math.round(result.wpm)} WPM</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    <p className={clsx(cardClass, 'mt-3 p-4 text-sm text-muted')}>Hali reytingga kiradigan maşq yöq.</p>
                )}
            </section>

            <section className="mt-6">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                    <LuHeadphones size={18} className="text-primary" aria-hidden />
                    Diktant
                </h2>
                {dictation ? (
                    <>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatTile className="w-auto" label="Jami ball" value={`${Math.round(num(dictation.total_ball))}`} valueClassName="text-primary" />
                            <StatTile className="w-auto" label="Diktantlar" value={`${num(dictation.dictations)} ta`} />
                            <StatTile className="w-auto" label="Örtaça baho" value={num(dictation.avg_baho).toFixed(1)} />
                            <StatTile className="w-auto" label="Reytingda" value={dictationRank ? `${dictationRank}-örin` : '—'} />
                        </div>
                        {recentDictations.length > 0 && (
                            <ul className={clsx(cardClass, 'mt-3 divide-y divide-line')}>
                                {recentDictations.map(work => (
                                    <li key={work.id} className="flex items-center gap-3 px-4 py-3">
                                        <span
                                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold text-white"
                                            style={{ backgroundColor: rateColor(work.baho) }}
                                            aria-label={`Baho: ${work.baho}`}
                                        >
                                            {work.baho}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{work.title}</p>
                                            <p className="font-mono text-[11px] text-muted">{formatDate(work.updatedAt)}</p>
                                        </div>
                                        <span className="font-mono text-sm text-muted">{Math.round(work.ball)} ball</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    <p className={clsx(cardClass, 'mt-3 p-4 text-sm text-muted')}>Hali diktant topşirilmagan.</p>
                )}
            </section>

            <p className="mt-6 text-center text-xs text-muted">
                <Link href="/app/hamjamiyat" className="text-primary underline-offset-2 hover:underline">
                    Hamjamiyat reytingiga qaytiş
                </Link>
            </p>
        </DashboardPage>
    );
};

export default PublicProfileView;
