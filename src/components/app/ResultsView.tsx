'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LuArrowRight, LuCalendar, LuInbox, LuPersonStanding, LuSlidersHorizontal, LuTarget, LuTimer, LuType } from 'react-icons/lu';
import clsx from 'clsx';

import { formatDate, formatTime, rateColor } from '@/lib/app/format';
import { loadTypingResults, loadWorks } from '@/lib/app/storage';
import { typingConfigLabel } from '@/lib/app/typing/config';
import { TypingResult } from '@/lib/app/typing/result';
import { Work } from '@/lib/app/types';
import { CardAction } from './dictation/DictationList';
import { Modal } from './Overlay';
import PageScaffold from './PageScaffold';
import SectionTabs from './SectionTabs';
import TypingResultView from './typing/TypingResultView';
import { AppButton, EmptyState, interactiveCardClass, MetaChip, Spinner, StatTile } from './ui';

/** "Mening natijalarim": topshirilgan diktantlar va tez yozish mashqlari tarixi. */
const ResultsView: React.FC<{ initialTab: number }> = ({ initialTab }) => {
    const [tab, setTab] = useState(initialTab);
    const [works, setWorks] = useState<Work[] | null>(null);
    const [typing, setTyping] = useState<TypingResult[] | null>(null);
    const [details, setDetails] = useState<TypingResult | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        setWorks(loadWorks());
        setTyping(loadTypingResults());
    }, []);

    return (
        <PageScaffold title="Mening natijalarim" className="!pt-4">
            <div className="glass w-full self-start rounded-full p-1.5 shadow-glow-soft sm:w-auto">
                <SectionTabs index={tab} onChange={setTab} expand />
            </div>

            {tab === 0 ? (
                works === null ? (
                    <Spinner className="flex-1" />
                ) : works.length === 0 ? (
                    <EmptyState icon={<LuInbox aria-hidden />} text="Sizda topshirilgan diktantlar yo‘q" />
                ) : (
                    works.map(work => <WorkCard key={work.id} work={work} />)
                )
            ) : typing === null ? (
                <Spinner className="flex-1" />
            ) : typing.length === 0 ? (
                <EmptyState icon={<LuInbox aria-hidden />} text="Hali tez yozish mashqini bajarmagansiz" />
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
                        Yopish
                    </AppButton>
                </div>
            </Modal>
        </PageScaffold>
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
                        <MetaChip icon={<LuType aria-hidden />}>So‘zlar soni: {work.text.length} ta</MetaChip>
                        <MetaChip icon={<LuPersonStanding aria-hidden />}>
                            Yosh chegarasi: {work.text.ageName} yosh, ({work.text.className})
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
            <StatTile className={tileClass} label="Eng yaxshi (WPM)" value={`${Math.round(best)}`} valueClassName="text-primary" />
            <StatTile className={tileClass} label="O‘rtacha (WPM)" value={`${Math.round(average)}`} />
            <StatTile className={tileClass} label="O‘rtacha aniqlik" value={`${Math.round(accuracy)}%`} />
            <StatTile className={tileClass} label="Mashqlar" value={`${results.length} ta`} />
        </div>
    );
};

const TypingCard: React.FC<{ result: TypingResult; onOpen: () => void }> = ({ result, onOpen }) => {
    const flags = [
        typingConfigLabel(result.config),
        result.config.punctuation && 'tinish belgilari',
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
