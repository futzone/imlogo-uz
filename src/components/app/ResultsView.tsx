'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    LuArrowRight,
    LuCalendar,
    LuInbox,
    LuPersonStanding,
    LuSlidersHorizontal,
    LuTarget,
    LuTimer,
    LuType,
    LuUploadCloud,
} from 'react-icons/lu';
import clsx from 'clsx';

import { formatDate, formatTime, rateColor } from '@/lib/app/format';
import { syncHistory } from '@/lib/app/history';
import { typingAlphabetLabel, typingConfigLabel } from '@/lib/app/typing/config';
import { TypingResult } from '@/lib/app/typing/result';
import { Work } from '@/lib/app/types';
import { useAuth } from './auth/AuthProvider';
import DashboardPage from './DashboardPage';
import { CardAction } from './dictation/DictationList';
import { Modal } from './Overlay';
import SectionTabs from './SectionTabs';
import TypingResultView from './typing/TypingResultView';
import { useHistory } from './useHistory';
import { AppButton, EmptyState, interactiveCardClass, MetaChip, Spinner, StatTile } from './ui';

/** "Mening natijalarim": topshirilgan diktantlar va tez yozish mashqlari tarixi. */
const ResultsView: React.FC<{ initialTab: number }> = ({ initialTab }) => {
    const [tab, setTab] = useState(initialTab);
    const [details, setDetails] = useState<TypingResult | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const { account, ready, openSignIn } = useAuth();
    const history = useHistory();
    const works = history?.works ?? null;
    const typing = history?.typing ?? null;
    const unsynced = history ? history.unsyncedTyping.length + history.unsyncedWorks.length : 0;

    const syncLocal = async () => {
        if (!account || !history || syncing) return;
        setSyncing(true);
        await syncHistory(account.id, history);
        setSyncing(false);
    };

    return (
        <DashboardPage
            title="Mening natijalarim"
            subtitle={
                account
                    ? 'Natijalaringiz hisobingizda saqlanadi va istalgan qurilmada körinadi.'
                    : 'Natijalar şu qurilmada saqlanadi. Hisobingizga kirsangiz, istalgan qurilmada körasiz.'
            }
            actions={
                ready && !account ? (
                    <AppButton variant="outline" onClick={openSignIn} className="!min-h-[40px]">
                        Kiriş
                    </AppButton>
                ) : undefined
            }
        >
            {account && unsynced > 0 && (
                <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center">
                    <LuUploadCloud size={22} className="shrink-0 text-primary" aria-hidden />
                    <p className="flex-1 text-sm">Şu qurilmada hisobingizga yuklanmagan {unsynced} ta natija bor.</p>
                    <AppButton onClick={syncLocal} className="!min-h-[40px] !px-5">
                        {syncing ? 'Yuklanmoqda…' : 'Hisobga yuklaş'}
                    </AppButton>
                </div>
            )}
            <div className="glass mt-6 w-full self-start rounded-full p-1.5 shadow-glow-soft sm:w-auto">
                <SectionTabs index={tab} onChange={setTab} expand />
            </div>

            {tab === 0 ? (
                works === null ? (
                    <Spinner className="flex-1" />
                ) : works.length === 0 ? (
                    <EmptyState icon={<LuInbox aria-hidden />} text="Sizda topşirilgan diktantlar yöq" />
                ) : (
                    works.map(work => <WorkCard key={work.id} work={work} />)
                )
            ) : typing === null ? (
                <Spinner className="flex-1" />
            ) : typing.length === 0 ? (
                <EmptyState icon={<LuInbox aria-hidden />} text="Hali tez yoziş maşqini bajarmagansiz" />
            ) : (
                <>
                    <TypingSummary results={typing} />
                    {typing.map(result => (
                        <TypingCard
                            key={result.id}
                            result={result}
                            onOpen={() => {
                                setDetails(result);
                                setDetailsOpen(true);
                            }}
                        />
                    ))}
                </>
            )}

            <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} className="max-w-[720px]">
                {details && <TypingResultView result={details} />}
                <div className="mt-6 flex justify-center">
                    <AppButton variant="ghost" onClick={() => setDetailsOpen(false)}>
                        Yopiş
                    </AppButton>
                </div>
            </Modal>
        </DashboardPage>
    );
};

const WorkCard: React.FC<{ work: Work }> = ({ work }) => {
    const color = rateColor(work.baho);

    return (
        <Link
            href={`/app/natija?id=${encodeURIComponent(work.id)}&tarix=1`}
            className={clsx(interactiveCardClass, 'mt-4 p-5')}
        >
            <span className="flex items-start gap-4">
                <span
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-mono text-[22px] font-medium"
                    style={{ color, borderColor: `${color}59`, backgroundColor: `${color}1A` }}
                >
                    {Math.round(work.baho)}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[17px] font-semibold leading-tight xl:text-xl">
                        {work.text.title}
                    </span>
                    <span className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2">
                        <MetaChip icon={<LuTimer aria-hidden />}>Sarflangan vaqt: {formatTime(work.worktime)}</MetaChip>
                        <MetaChip icon={<LuType aria-hidden />}>Sözlar soni: {work.text.length} ta</MetaChip>
                        <MetaChip icon={<LuPersonStanding aria-hidden />}>
                            Yoş çegarasi: {work.text.ageName} yoş, ({work.text.className})
                        </MetaChip>
                    </span>
                </span>
                <CardAction className="mt-3 hidden sm:inline-flex">Batafsil</CardAction>
            </span>
            <CardAction className="mt-3 flex justify-end sm:hidden">Batafsil</CardAction>
        </Link>
    );
};

const TypingSummary: React.FC<{ results: TypingResult[] }> = ({ results }) => {
    const best = Math.max(...results.map(r => r.wpm));
    const average = results.reduce((sum, r) => sum + r.wpm, 0) / results.length;
    const accuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
    const tileClass = 'w-auto sm:w-[150px]';

    return (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <StatTile className={tileClass} label="Eng yaxşi (WPM)" value={`${Math.round(best)}`} valueClassName="text-primary" />
            <StatTile className={tileClass} label="Örtaça (WPM)" value={`${Math.round(average)}`} />
            <StatTile className={tileClass} label="Örtaça aniqlik" value={`${Math.round(accuracy)}%`} />
            <StatTile className={tileClass} label="Maşqlar" value={`${results.length} ta`} />
        </div>
    );
};

const TypingCard: React.FC<{ result: TypingResult; onOpen: () => void }> = ({ result, onOpen }) => {
    const flags = [
        typingConfigLabel(result.config),
        result.config.alphabet !== 'lotin' && typingAlphabetLabel(result.config),
        result.config.punctuation && 'tiniş belgilari',
        result.config.numbers && 'raqamlar',
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <button type="button" onClick={onOpen} className={clsx(interactiveCardClass, 'mt-3 px-5 py-4')}>
            <span className="flex items-center gap-2">
                <span className="w-[72px] shrink-0">
                    <span className="text-gradient block w-fit font-mono text-[28px] font-medium leading-none">
                        {Math.round(result.wpm)}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                        WPM
                    </span>
                </span>
                <span className="flex min-w-0 flex-1 flex-wrap gap-x-5 gap-y-2">
                    <MetaChip icon={<LuTarget aria-hidden />}>Aniqlik: {Math.round(result.accuracy)}%</MetaChip>
                    <MetaChip icon={<LuSlidersHorizontal aria-hidden />}>{flags}</MetaChip>
                    <MetaChip icon={<LuCalendar aria-hidden />}>{formatDate(result.createdAt)}</MetaChip>
                </span>
                <LuArrowRight size={18} className="shrink-0 text-primary" aria-hidden />
            </span>
        </button>
    );
};

export default ResultsView;
