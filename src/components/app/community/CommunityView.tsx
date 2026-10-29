'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { LuCrown, LuHeadphones, LuHourglass, LuKeyboard, LuMedal, LuSpellCheck, LuTrophy, LuUsers } from 'react-icons/lu';

import {
    avatarUrl,
    Board,
    fetchLeaderboard,
    fetchHardWords,
    HARD_WORDS_MIN_ATTEMPTS,
    HardWord,
    HardWordsSort,
    fetchMyRank,
    LeaderboardPeriod,
    LeaderRow,
} from '@/lib/app/account';
import { useAuth } from '../auth/AuthProvider';
import DashboardPage from '../DashboardPage';
import { Segmented } from '../form';
import Avatar from '../shell/Avatar';
import { AppButton, cardClass, EmptyState, Spinner } from '../ui';

interface Metric {
    value: string;
    label: string;
    hint: string;
    /** Reytingda qatnashish sharti (PocketBase filtri). */
    filter: string;
    format: (row: LeaderRow) => string;
    /** Qator ostidagi qisqa ma'lumot. */
    details: (row: LeaderRow) => string;
}

const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} daq`;
    return `${Math.floor(minutes / 60)} soat ${minutes % 60} daq`;
};

const ACCURACY_MIN_GAMES = 10;
const BAHO_MIN_DICTATIONS = 3;

/** Serverdan kelgan qiymat bo'lmasligi ham mumkin (masalan, eski view) — 0 deb olinadi. */
const num = (value: number | undefined) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const typingDetails = (row: LeaderRow) =>
    `${num(row.games)} ta maşq · örtaça ${Math.round(num(row.avg_wpm))} WPM · ${Math.round(num(row.avg_accuracy))}%`;
const dictationDetails = (row: LeaderRow) =>
    `${num(row.dictations)} ta diktant · örtaça baho ${num(row.avg_baho).toFixed(1)} · ${Math.round(num(row.avg_ball))} ball`;

const metrics: Record<Board, Metric[]> = {
    typing: [
        {
            value: 'best_wpm',
            label: 'Eng tez',
            hint: 'Eng yaxşi natija (daqiqasiga söz). Aniqligi 75% dan past maşqlar hisobga olinmaydi.',
            filter: 'best_wpm > 0',
            format: row => `${Math.round(num(row.best_wpm))} WPM`,
            details: typingDetails,
        },
        {
            value: 'games',
            label: 'Eng faol',
            hint: 'Bajarilgan maşqlar soni.',
            filter: 'games > 0',
            format: row => `${num(row.games)} ta`,
            details: typingDetails,
        },
        {
            value: 'total_seconds',
            label: 'Köp vaqt',
            hint: 'Maşq qilişga sarflangan umumiy vaqt.',
            filter: 'total_seconds > 0',
            format: row => formatDuration(num(row.total_seconds)),
            details: typingDetails,
        },
        {
            value: 'avg_accuracy',
            label: 'Eng aniq',
            hint: `Örtaça aniqlik. Kamida ${ACCURACY_MIN_GAMES} ta maşq bajarganlar qatnaşadi.`,
            filter: `games >= ${ACCURACY_MIN_GAMES}`,
            format: row => `${Math.round(num(row.avg_accuracy))}%`,
            details: typingDetails,
        },
    ],
    dictation: [
        {
            value: 'total_ball',
            label: 'Eng köp ball',
            hint: 'Barça diktantlardan töplangan ball (har bir diktant böyiça oxirgi natija).',
            filter: 'total_ball > 0',
            format: row => `${Math.round(num(row.total_ball))} ball`,
            details: dictationDetails,
        },
        {
            value: 'dictations',
            label: 'Eng faol',
            hint: 'Topşirilgan diktantlar soni.',
            filter: 'dictations > 0',
            format: row => `${num(row.dictations)} ta`,
            details: dictationDetails,
        },
        {
            value: 'avg_ball',
            label: 'Eng savodli',
            hint: `Örtaça ball. Kamida ${BAHO_MIN_DICTATIONS} ta diktant topşirganlar qatnaşadi.`,
            filter: `dictations >= ${BAHO_MIN_DICTATIONS}`,
            format: row => `${Math.round(num(row.avg_ball))} ball`,
            details: dictationDetails,
        },
    ],
};

/** Hamjamiyat yorliqlari: ikki reyting va tez yozishdagi qiyin so'zlar. */
type Tab = Board | 'mistakes';

const tabs: { value: Tab; label: string }[] = [
    { value: 'typing', label: 'Tez yoziş' },
    { value: 'dictation', label: 'Diktant' },
    { value: 'mistakes', label: 'Qiyin sözlar' },
];

const periods: { value: LeaderboardPeriod; label: string }[] = [
    { value: 'week', label: 'Şu hafta' },
    { value: 'all', label: 'Hamma vaqt' },
];

const displayName = (row: LeaderRow) => row.name?.trim() || 'Foydalanuvçi';
const rowAccount = (row: LeaderRow) => ({ name: displayName(row), avatarUrl: avatarUrl(row.id, row.avatar) });
const profileHref = (row: LeaderRow) => `/app/foydalanuvchi/${row.id}`;

/** Haftalik musobaqa dushanba 00:00 (Toshkent, UTC+5) da yangilanadi. */
const TASHKENT_OFFSET_MS = 5 * 3600 * 1000;

const weekEnd = (now: number): number => {
    const local = new Date(now + TASHKENT_OFFSET_MS);
    const daysToMonday = (8 - local.getUTCDay()) % 7 || 7;
    return Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + daysToMonday) - TASHKENT_OFFSET_MS;
};

const formatCountdown = (ms: number) => {
    const minutes = Math.max(0, Math.floor(ms / 60000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return days > 0 ? `${days} kun ${hours} soat` : `${hours} soat ${minutes % 60} daq`;
};

type State =
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'ready'; key: string; rows: LeaderRow[]; me: { rank: number; row: LeaderRow } | null };

/** "Hamjamiyat": tez yozish va diktant bo'yicha reytinglar hamda haftalik musobaqa. */
const CommunityView: React.FC = () => {
    const [tab, setTab] = useState<Tab>('typing');

    return (
        <DashboardPage
            title="Hamjamiyat"
            subtitle="Imlo Go foydalanuvçilari reytingi va haftalik musobaqa. Hisobingizga kiring — natijalaringiz reytingga avtomatik qöşiladi."
        >
            {tab === 'mistakes' ? (
                <HardWords tabs={<Segmented className="mt-6 w-full md:w-auto md:self-start" options={tabs} value={tab} onChange={setTab} />} />
            ) : (
                <Leaderboards key={tab} board={tab} onTabChange={setTab} />
            )}
        </DashboardPage>
    );
};

/** Tez yozish yoki diktant reytingi. */
const Leaderboards: React.FC<{ board: Board; onTabChange: (tab: Tab) => void }> = ({ board, onTabChange }) => {
    const { account, ready, openSignIn } = useAuth();
    const [metricIndex, setMetricIndex] = useState(0);
    const [period, setPeriod] = useState<LeaderboardPeriod>('week');
    const [state, setState] = useState<State>({ status: 'loading' });
    const userId = account?.id ?? null;
    const metric = metrics[board][metricIndex] ?? metrics[board][0];
    // Yorliq almashgan zahoti eski qatorlar yangi ko'rsatkich bilan chizilmasligi uchun
    // natija qaysi so'rovga tegishli ekani saqlanadi.
    const requestKey = `${board}:${period}:${metric.value}`;

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        setState({ status: 'loading' });
        Promise.all([
            fetchLeaderboard(board, period, metric.value, metric.filter),
            userId ? fetchMyRank(board, period, metric.value, metric.filter, userId).catch(() => null) : null,
        ])
            .then(([rows, me]) => !cancelled && setState({ status: 'ready', key: requestKey, rows, me }))
            .catch(() => !cancelled && setState({ status: 'error' }));
        return () => {
            cancelled = true;
        };
    }, [board, period, metric, userId, ready, requestKey]);

    const view: State = state.status === 'ready' && state.key !== requestKey ? { status: 'loading' } : state;

    return (
        <>
            <WeeklyBanner board={board} />

            <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <Segmented className="w-full md:w-auto" options={tabs} value={board} onChange={onTabChange} />
                <Segmented className="w-full md:w-auto" options={periods} value={period} onChange={setPeriod} />
            </div>
            <Segmented
                className="mt-2 w-full overflow-x-auto md:w-auto md:self-start"
                options={metrics[board].map((m, i) => ({ value: String(i), label: m.label }))}
                value={String(metricIndex)}
                onChange={value => setMetricIndex(Number(value))}
            />
            <p className="mt-2 text-xs text-muted">{metric.hint}</p>

            {ready && !account && (
                <div className={clsx(cardClass, 'mt-4 flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center')}>
                    <LuTrophy size={22} className="shrink-0 text-primary" aria-hidden />
                    <p className="flex-1 text-sm">Reytingda qatnaşiş uçun hisobingizga kiring.</p>
                    <AppButton onClick={openSignIn} className="!min-h-[40px] !px-5">
                        Kiriş
                    </AppButton>
                </div>
            )}

            {view.status === 'loading' ? (
                <Spinner className="flex-1 py-16" />
            ) : view.status === 'error' ? (
                <EmptyState
                    icon={<LuUsers aria-hidden />}
                    tone="danger"
                    text="Reytingni yuklab bölmadi. Birozdan söng qayta urinib köring."
                />
            ) : view.rows.length === 0 ? (
                <EmptyState
                    icon={board === 'typing' ? <LuKeyboard aria-hidden /> : <LuHeadphones aria-hidden />}
                    text="Bu reytingda hali heç kim yöq. Birinçi böling!"
                >
                    <AppButton href={board === 'typing' ? '/app/tez-yozish' : '/app'}>
                        {board === 'typing' ? 'Maşqni boşlaş' : 'Diktant yoziş'}
                    </AppButton>
                </EmptyState>
            ) : (
                <>
                    {view.me && !view.rows.some(row => row.id === view.me?.row.id) && (
                        <div className="mt-4">
                            <LeaderItem rank={view.me.rank} row={view.me.row} metric={metric} highlight />
                        </div>
                    )}
                    <ol className="mt-4 flex flex-col gap-2">
                        {view.rows.map((row, i) => (
                            <li key={row.id}>
                                <LeaderItem rank={i + 1} row={row} metric={metric} highlight={row.id === userId} />
                            </li>
                        ))}
                    </ol>
                </>
            )}
        </>
    );
};

const hardWordSorts: { value: HardWordsSort; label: string; hint: string }[] = [
    { value: 'users', label: 'Eng köp odam', hint: 'Eng köp foydalanuvçi xato qilgan sözlar.' },
    {
        value: 'rate',
        label: 'Eng qiyin',
        hint: `Xato ulişi eng yuqori sözlar (kamida ${HARD_WORDS_MIN_ATTEMPTS} marta terilganlar).`,
    },
];

/** Tez yozishda eng ko'p xato qilinadigan so'zlar. */
const HardWords: React.FC<{ tabs: React.ReactNode }> = ({ tabs: tabSwitch }) => {
    const [sort, setSort] = useState<HardWordsSort>('users');
    const [result, setResult] = useState<{ sort: HardWordsSort; words: HardWord[] | 'error' } | null>(null);
    const words = result?.sort === sort ? result.words : null;

    useEffect(() => {
        let cancelled = false;
        fetchHardWords(sort, 50)
            .then(list => !cancelled && setResult({ sort, words: list }))
            .catch(() => !cancelled && setResult({ sort, words: 'error' }));
        return () => {
            cancelled = true;
        };
    }, [sort]);

    const top = Array.isArray(words) && words.length ? (sort === 'users' ? words[0].users : words[0].errorRate) : 1;

    return (
        <>
            {tabSwitch}
            <Segmented
                className="mt-2 w-full md:w-auto md:self-start"
                options={hardWordSorts}
                value={sort}
                onChange={setSort}
            />
            <p className="mt-2 text-xs text-muted">
                Tez yoziş maşqlarida terilayotganda xato bosilgan sözlar (tuzatilgan bölsa ham).{' '}
                {hardWordSorts.find(s => s.value === sort)?.hint}
            </p>
            {words === null ? (
                <Spinner className="flex-1 py-16" />
            ) : words === 'error' ? (
                <EmptyState
                    icon={<LuSpellCheck aria-hidden />}
                    tone="danger"
                    text="Röyxatni yuklab bölmadi. Birozdan söng qayta urinib köring."
                />
            ) : words.length === 0 ? (
                <EmptyState icon={<LuSpellCheck aria-hidden />} text="Hali ma’lumot yetarli emas. Tez yoziş maşqini bajaring!">
                    <AppButton href="/app/tez-yozish">Maşqni boşlaş</AppButton>
                </EmptyState>
            ) : (
                <ol className="mt-4 flex flex-col gap-2">
                    {words.map((item, i) => {
                        const value = sort === 'users' ? item.users : item.errorRate;
                        return (
                            <li key={item.word} className={clsx(cardClass, 'relative overflow-hidden px-4 py-3')}>
                                <span
                                    className="absolute inset-y-0 left-0 bg-danger/[0.06]"
                                    style={{ width: `${Math.max(4, (value / (top || 1)) * 100)}%` }}
                                    aria-hidden
                                />
                                <div className="relative flex items-center gap-3 sm:gap-4">
                                    <span className="flex w-8 shrink-0 justify-center">{rankBadge(i + 1)}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-heading text-lg font-semibold leading-tight">{item.word}</p>
                                        <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                                            {item.users} / {item.typists} kişi xato qilgan · {item.mistakes} / {item.attempts} uriniş
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-right font-mono text-lg font-medium text-danger-deep">
                                        {sort === 'users' ? `${item.users} kişi` : `${Math.round(item.errorRate)}%`}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </>
    );
};

/** Haftalik musobaqa: tugashiga qolgan vaqt va o'tgan hafta g'oliblari. */
const WeeklyBanner: React.FC<{ board: Board }> = ({ board }) => {
    const [now, setNow] = useState<number | null>(null);
    const [result, setResult] = useState<{ board: Board; rows: LeaderRow[] } | null>(null);
    const winners = result?.board === board ? result.rows : null;
    const metric = metrics[board][0];

    useEffect(() => {
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetchLeaderboard(board, 'prev_week', metric.value, metric.filter, 3)
            .then(rows => !cancelled && setResult({ board, rows }))
            .catch(() => !cancelled && setResult({ board, rows: [] }));
        return () => {
            cancelled = true;
        };
    }, [board, metric]);

    return (
        <section className="relative mt-6 overflow-hidden rounded-2xl bg-brand-gradient p-5 text-white shadow-glow sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/75">Haftalik musobaqa</p>
                    <p className="mt-1 font-heading text-xl font-bold sm:text-2xl">
                        {board === 'typing' ? 'Hafta eng tezkori kim?' : 'Hafta eng savodlisi kim?'}
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                        Har duşanba 00:00 da (Toşkent vaqti) yangi hafta boşlanadi.
                    </p>
                </div>
                {now !== null && (
                    <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5">
                        <LuHourglass size={18} aria-hidden />
                        <span className="font-mono text-sm">Tugaşiga: {formatCountdown(weekEnd(now) - now)}</span>
                    </div>
                )}
            </div>
            {winners && winners.length > 0 && (
                <div className="mt-4 border-t border-white/20 pt-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/75">Ötgan hafta ğoliblari</p>
                    <ol className="mt-2 flex flex-wrap gap-2">
                        {winners.map((row, i) => (
                            <li key={row.id}>
                                <Link
                                    href={profileHref(row)}
                                    className="flex items-center gap-2 rounded-full bg-white/15 py-1 pl-1 pr-3 text-sm transition-colors hover:bg-white/25"
                                >
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white font-mono text-xs font-bold text-primary">
                                        {i + 1}
                                    </span>
                                    <Avatar account={rowAccount(row)} className="!h-7 !w-7 !border-white/40 !text-xs" />
                                    <span className="max-w-[140px] truncate font-semibold">{displayName(row)}</span>
                                    <span className="font-mono text-xs text-white/80">{metric.format(row)}</span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </section>
    );
};

const rankBadge = (rank: number) => {
    if (rank === 1) return <LuCrown size={20} className="text-[#E0A800]" aria-label="1-örin" />;
    if (rank === 2) return <LuMedal size={20} className="text-[#9AA3B2]" aria-label="2-örin" />;
    if (rank === 3) return <LuMedal size={20} className="text-[#C27C4E]" aria-label="3-örin" />;
    return <span className="font-mono text-sm font-medium text-muted">{rank}</span>;
};

const LeaderItem: React.FC<{ rank: number; row: LeaderRow; metric: Metric; highlight?: boolean }> = ({
    rank,
    row,
    metric,
    highlight,
}) => (
    <Link
        href={profileHref(row)}
        className={clsx(
            cardClass,
            'flex items-center gap-3 px-4 py-3 transition-colors hover:border-primary/40 sm:gap-4',
            highlight && '!border-primary/60 shadow-glow-card',
            rank <= 3 && 'bg-gradient-to-r from-tertiary/20 to-white'
        )}
    >
        <span className="flex w-8 shrink-0 justify-center">{rankBadge(rank)}</span>
        <Avatar account={rowAccount(row)} className="!h-9 !w-9 !text-sm" />
        <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-tight">
                {displayName(row)}
                {highlight && <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">siz</span>}
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted">{metric.details(row)}</p>
        </div>
        <span className="shrink-0 text-right font-mono text-lg font-medium text-primary sm:text-xl">
            {metric.format(row)}
        </span>
    </Link>
);

export default CommunityView;
