'use client';

import { useEffect, useRef, useState } from 'react';
import {
    LuArrowRight,
    LuCalendar,
    LuCheck,
    LuCloudOff,
    LuHeadphones,
    LuPersonStanding,
    LuRefreshCw,
    LuTimer,
    LuType,
} from 'react-icons/lu';
import clsx from 'clsx';

import Badge from '@/components/ui/Badge';
import {
    fetchNextDictations,
    hasMoreDictations,
    refreshDictations,
    useDictations,
} from '@/lib/app/dictationStore';
import { formatDate } from '@/lib/app/format';
import { Dictation } from '@/lib/app/types';
import { AppButton, EmptyState, interactiveCardClass, MetaChip, Spinner } from '../ui';
import { useHistory } from '../useHistory';
import BeforeStartSheet from './BeforeStartSheet';

/** Diktantlar ro'yxati (sahifalab yuklanadi). */
const DictationList: React.FC = () => {
    const state = useDictations();
    const history = useHistory();
    const doneIds = new Set(history?.works.map(work => work.id) ?? []);
    const [selected, setSelected] = useState<Dictation | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const hasMore = hasMoreDictations(state);

    useEffect(() => {
        fetchNextDictations();
    }, []);

    // Ro'yxat oxiriga yaqinlashganda keyingi sahifa yuklanadi.
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) fetchNextDictations();
            },
            { rootMargin: '200px' }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, state.items.length]);

    if (state.isInitialLoading) return <Spinner className="flex-1" />;

    if (state.error && state.items.length === 0) {
        return (
            <EmptyState icon={<LuCloudOff aria-hidden />} tone="danger" text={`Xatolik yuz berdi: ${state.error}`}>
                <AppButton variant="outline" icon={<LuRefreshCw size={20} aria-hidden />} onClick={refreshDictations}>
                    Qayta uriniş
                </AppButton>
            </EmptyState>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[960px] px-4 pb-8 pt-6 sm:px-6">
            <div className="mb-2">
                <Badge pulse>{doneIds.size === 0 ? 'Audio diktantlar' : `Bajarilgan: ${doneIds.size} ta`}</Badge>
                <h1 className="mt-3 text-[26px] font-bold sm:text-4xl">
                    Diktantni tanlang va <span className="text-gradient">yozişni boşlang</span>
                </h1>
                <p className="mt-2 text-[15px] text-muted">
                    Audio eşitasiz, matnni yozasiz, tizim esa imlo xatolarni avtomatik tekşiradi.
                </p>
            </div>

            {state.items.map(item => (
                <DictationCard
                    key={item.id}
                    dictation={item}
                    done={doneIds.has(item.id)}
                    onSelect={() => {
                        setSelected(item);
                        setSheetOpen(true);
                    }}
                />
            ))}

            {hasMore && (
                <div ref={sentinelRef}>
                    {state.error ? (
                        <div className="flex justify-center pt-6">
                            <AppButton
                                variant="outline"
                                icon={<LuRefreshCw size={20} aria-hidden />}
                                onClick={fetchNextDictations}
                            >
                                Qayta uriniş
                            </AppButton>
                        </div>
                    ) : (
                        <Spinner />
                    )}
                </div>
            )}

            <BeforeStartSheet dictation={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
        </div>
    );
};

interface CardProps {
    dictation: Dictation;
    done: boolean;
    onSelect: () => void;
}

const DictationCard: React.FC<CardProps> = ({ dictation, done, onSelect }) => {
    const created = formatDate(dictation.createdDate);

    return (
        <button type="button" onClick={onSelect} className={clsx(interactiveCardClass, 'mt-4 p-5')}>
            <span className="flex items-start gap-4">
                <span
                    className={clsx(
                        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[22px]',
                        done
                            ? 'border-success/30 bg-success/10 text-success'
                            : 'border-primary/30 bg-primary/10 text-primary'
                    )}
                >
                    {done ? <LuCheck aria-hidden /> : <LuHeadphones aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[17px] font-semibold leading-tight xl:text-xl">
                        {dictation.title}
                    </span>
                    <span className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2">
                        <MetaChip icon={<LuTimer aria-hidden />}>Davomiyligi: {dictation.time} min</MetaChip>
                        <MetaChip icon={<LuType aria-hidden />}>Sözlar soni: {dictation.length} ta</MetaChip>
                        <MetaChip icon={<LuPersonStanding aria-hidden />}>
                            Yoş çegarasi: {dictation.ageName} yoş, ({dictation.className})
                        </MetaChip>
                        {created && <MetaChip icon={<LuCalendar aria-hidden />}>Qöşilgan vaqti: {created}</MetaChip>}
                    </span>
                </span>
                <CardAction className="mt-3 hidden sm:inline-flex">Boşlaş</CardAction>
            </span>
            <CardAction className="mt-3 flex justify-end sm:hidden">Boşlaş</CardAction>
        </button>
    );
};

/** Kartaning o'ng tomonidagi "Boshlash →" / "Batafsil →" yozuvi. */
export const CardAction: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
    <span className={clsx('shrink-0 items-center gap-1.5 text-[15px] font-semibold text-primary', className)}>
        {children}
        <LuArrowRight size={18} aria-hidden />
    </span>
);

export default DictationList;
