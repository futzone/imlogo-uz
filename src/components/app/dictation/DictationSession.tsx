'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LuCheck, LuCloudOff, LuGauge, LuPause, LuPlay, LuRotateCcw, LuTimer } from 'react-icons/lu';
import clsx from 'clsx';

import { findLoadedDictation } from '@/lib/app/dictationStore';
import { DiktantEvaluator } from '@/lib/app/evaluator';
import { formatTime } from '@/lib/app/format';
import { fetchDictation } from '@/lib/app/pocketbase';
import { saveWork } from '@/lib/app/storage';
import { Dictation } from '@/lib/app/types';
import { Modal, ModalTitle } from '../Overlay';
import PageScaffold from '../PageScaffold';
import { AppButton, EmptyState, Spinner } from '../ui';

/** Diktant yozish sahifasi: audio pleyer, taymer va matn kiritish maydoni. */
const DictationSession: React.FC<{ id: string }> = ({ id }) => {
    const [dictation, setDictation] = useState<Dictation | null>(() => findLoadedDictation(id) ?? null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (dictation) return;
        let cancelled = false;
        fetchDictation(id)
            .then(result => !cancelled && setDictation(result))
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, [id, dictation]);

    if (dictation) return <Session dictation={dictation} />;

    return (
        <PageScaffold title="Diktant">
            {failed ? (
                <EmptyState icon={<LuCloudOff aria-hidden />} tone="danger" text="Diktantni yuklab bo‘lmadi">
                    <AppButton variant="outline" href="/app">
                        Bosh sahifaga
                    </AppButton>
                </EmptyState>
            ) : (
                <Spinner className="flex-1" />
            )}
        </PageScaffold>
    );
};

const Session: React.FC<{ dictation: Dictation }> = ({ dictation }) => {
    const router = useRouter();
    const totalSeconds = dictation.time * 60;

    const audioRef = useRef<HTMLAudioElement>(null);
    // Sahifadan ataylab chiqilganda (yakunlash/bekor qilish) brauzer ogohlantirishi kerak emas.
    const leavingRef = useRef(false);

    const [remaining, setRemaining] = useState(totalSeconds);
    const [text, setText] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [slow, setSlow] = useState(false);
    const [confirmExit, setConfirmExit] = useState(false);

    useEffect(() => {
        // Brauzer avtomatik ijroga ruxsat bermasa, pleyer to'xtatilgan holatda qoladi.
        audioRef.current?.play().catch(() => {});
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setRemaining(value => Math.max(0, value - 1)), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const warn = (event: BeforeUnloadEvent) => {
            if (!leavingRef.current) event.preventDefault();
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, []);

    const syncDuration = useCallback(() => {
        const value = audioRef.current?.duration ?? 0;
        setDuration(Number.isFinite(value) ? value : 0);
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) audio.play().catch(() => {});
        else audio.pause();
    };

    const toggleSpeed = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.playbackRate = slow ? 1 : 0.5;
        setSlow(!slow);
    };

    const seek = (seconds: number) => {
        const audio = audioRef.current;
        if (!audio || duration <= 0) return;
        audio.currentTime = Math.min(Math.max(0, seconds), duration);
        setPosition(audio.currentTime);
    };

    const exit = () => {
        leavingRef.current = true;
        router.push('/app');
    };

    const complete = () => {
        const input = text.trim();
        const evaluator = new DiktantEvaluator(dictation.text, input);
        evaluator.analyze();

        saveWork({
            id: dictation.id,
            createdDate: new Date().toISOString(),
            ball: evaluator.evaluate100PointScale(),
            baho: evaluator.evaluate5PointScale(),
            errors: evaluator.errors,
            text: dictation,
            imloErrorCount: evaluator.imloErrorCount,
            punktuatsionErrorCount: evaluator.punktuatsionErrorCount,
            uslubiyErrorCount: evaluator.uslubiyErrorCount,
            grafikErrorCount: evaluator.grafikErrorCount,
            worktime: totalSeconds - remaining,
            input,
        });

        leavingRef.current = true;
        // "Orqaga" bosilganda yozish sahifasiga qaytilmasligi uchun tarixdagi yozuv almashtiriladi.
        router.replace(`/app/natija?id=${encodeURIComponent(dictation.id)}`);
    };

    const lastMinute = remaining <= 60;
    const progress = duration > 0 ? (Math.min(position, duration) / duration) * 100 : 0;

    const slider = (
        <input
            type="range"
            aria-label="Audio holati"
            className="audio-range min-w-0 flex-1"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
            min={0}
            max={duration || 1}
            step="any"
            value={Math.min(position, duration)}
            onChange={event => seek(Number(event.target.value))}
        />
    );
    const controls = (
        <div className="flex shrink-0 gap-1.5">
            <PlayerButton badge="0.5x" tooltip="Tezlik: 0.5x / 1x" active={slow} onClick={toggleSpeed}>
                <LuGauge aria-hidden />
            </PlayerButton>
            <PlayerButton badge="15s" tooltip="15 soniya orqaga" onClick={() => seek(Math.floor(position) - 15)}>
                <LuRotateCcw aria-hidden />
            </PlayerButton>
            <PlayerButton filled tooltip={isPlaying ? 'To‘xtatish' : 'Davom ettirish'} onClick={togglePlay}>
                {isPlaying ? <LuPause aria-hidden /> : <LuPlay aria-hidden />}
            </PlayerButton>
        </div>
    );

    return (
        <PageScaffold
            title={dictation.title}
            onBack={() => setConfirmExit(true)}
            actions={
                <span
                    className={clsx(
                        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 font-mono text-[15px] font-medium leading-none',
                        lastMinute
                            ? 'border-danger/30 bg-danger/10 text-danger'
                            : 'border-primary/30 bg-primary/10 text-primary'
                    )}
                    role="timer"
                    aria-label="Qolgan vaqt"
                >
                    <LuTimer size={18} aria-hidden />
                    {formatTime(remaining)}
                </span>
            }
        >
            <audio
                ref={audioRef}
                src={dictation.url ?? undefined}
                preload="auto"
                onLoadedMetadata={syncDuration}
                onDurationChange={syncDuration}
                onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Audio pleyer paneli: gradient fon, vaqt, tezlik, orqaga qaytarish */}
            <div className="rounded-2xl bg-brand-gradient p-4 font-mono text-[15px] font-medium text-white shadow-glow">
                <div className="hidden items-center gap-3 sm:flex">
                    <span>{formatTime(position)}</span>
                    {slider}
                    <span>{formatTime(duration)}</span>
                    {controls}
                </div>
                <div className="sm:hidden">
                    <div className="flex">{slider}</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="truncate">
                            {formatTime(position)} / {formatTime(duration)}
                        </span>
                        {controls}
                    </div>
                </div>
            </div>

            <label
                htmlFor="dictation-input"
                className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted"
            >
                Diktant matnini kiritish
            </label>
            <textarea
                id="dictation-input"
                value={text}
                onChange={event => setText(event.target.value)}
                rows={8}
                placeholder="Matn kiriting"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="sentences"
                className="mt-2.5 min-h-[14rem] w-full flex-1 resize-y rounded-xl border border-primary/30 bg-white/85 p-4 text-base leading-relaxed caret-primary !outline-none transition-shadow placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary"
            />

            <div className="mt-6 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end sm:gap-4">
                <AppButton variant="danger" onClick={() => setConfirmExit(true)}>
                    Bekor qilish
                </AppButton>
                <AppButton onClick={complete} trailingIcon={<LuCheck size={18} aria-hidden />}>
                    Diktantni yakunlash
                </AppButton>
            </div>

            <Modal open={confirmExit} onClose={() => setConfirmExit(false)} className="max-w-md">
                <ModalTitle className="font-heading text-lg font-bold">Diktantni bekor qilish</ModalTitle>
                <p className="mt-3 text-[15px] text-muted">
                    Diktant hali yakunlanmagan. Chiqib ketsangiz, natijalar saqlanmaydi. Chiqishni xohlaysizmi?
                </p>
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                    <AppButton variant="ghost" onClick={() => setConfirmExit(false)}>
                        Yo‘q, davom etish
                    </AppButton>
                    <AppButton variant="danger" onClick={exit}>
                        Ha, chiqish
                    </AppButton>
                </div>
            </Modal>
        </PageScaffold>
    );
};

interface PlayerButtonProps {
    tooltip: string;
    badge?: string;
    filled?: boolean;
    active?: boolean;
    onClick: () => void;
}

const PlayerButton: React.FC<React.PropsWithChildren<PlayerButtonProps>> = ({
    tooltip,
    badge,
    filled,
    active,
    onClick,
    children,
}) => (
    <button
        type="button"
        title={tooltip}
        aria-label={tooltip}
        aria-pressed={active}
        onClick={onClick}
        className={clsx(
            'relative inline-flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-colors focus-visible:outline-white',
            filled ? 'bg-white text-primary' : active ? 'bg-white/30 text-white' : 'bg-white/[0.12] text-white hover:bg-white/20'
        )}
    >
        {children}
        {badge && (
            <span className="absolute right-0 top-0 rounded bg-white px-[3px] py-px font-mono text-[8px] font-bold leading-tight text-primary">
                {badge}
            </span>
        )}
    </button>
);

export default DictationSession;
