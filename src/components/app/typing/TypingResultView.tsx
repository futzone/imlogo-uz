import { LuHistory, LuRefreshCw } from 'react-icons/lu';

import Badge from '@/components/ui/Badge';
import { typingConfigLabel } from '@/lib/app/typing/config';
import { TypingResult } from '@/lib/app/typing/result';
import { AppButton, cardClass, CornerAccents, StatTile } from '../ui';
import TypingChart from './TypingChart';

interface Props {
    result: TypingResult;
    /** Shu sozlamadagi avvalgi eng yaxshi natija (bo'lmasa `null`). */
    previousBest?: number | null;
    onRestart?: () => void;
    historyHref?: string;
}

/** Mashq yakunidagi natija: tezlik, aniqlik, grafik va batafsil ko'rsatkichlar. */
const TypingResultView: React.FC<Props> = ({ result, previousBest = null, onRestart, historyHref }) => {
    const { config } = result;
    const isRecord = previousBest !== null && result.wpm > previousBest && result.wpm > 0;
    const headlineClass = 'font-mono text-[56px] font-medium leading-none sm:text-[80px]';
    const captionClass = 'mt-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted';

    return (
        <div className="flex w-full flex-col items-center">
            <div className="flex flex-wrap justify-center gap-2">
                <Badge>{typingConfigLabel(config)}</Badge>
                {config.punctuation && <Badge>tinish belgilari</Badge>}
                {config.numbers && <Badge>raqamlar</Badge>}
                {isRecord && (
                    <Badge pulse tone="success">
                        Yangi rekord
                    </Badge>
                )}
            </div>

            <div className="mt-5 flex items-end gap-8 text-center sm:gap-16">
                <div>
                    <p className={`${headlineClass} text-gradient`}>{Math.round(result.wpm)}</p>
                    <p className={captionClass}>so‘z/daqiqa (WPM)</p>
                </div>
                <div>
                    <p className={headlineClass}>{Math.round(result.accuracy)}%</p>
                    <p className={captionClass}>aniqlik</p>
                </div>
            </div>

            <div className={`${cardClass} relative mt-6 h-[168px] w-full bg-white/80 pb-3 pl-4 pr-5 pt-4 sm:h-[208px]`}>
                <CornerAccents />
                <TypingChart samples={result.samples} />
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
                <StatTile label="Xom tezlik" value={`${Math.round(result.raw)}`} hint="Xatolar hisobga olinmagan tezlik" />
                <StatTile
                    label="Belgilar"
                    value={`${result.correctChars}/${result.incorrectChars}/${result.extraChars}/${result.missedChars}`}
                    hint="to‘g‘ri / xato / ortiqcha / tushib qolgan"
                />
                <StatTile
                    label="Barqarorlik"
                    value={`${Math.round(result.consistency)}%`}
                    hint="Tezlik mashq davomida qanchalik bir tekis bo‘lgani"
                />
                <StatTile label="Vaqt" value={`${Math.round(result.seconds)}s`} />
                {previousBest !== null && (
                    <StatTile label="Avvalgi rekord" value={`${Math.round(previousBest)}`} valueClassName="text-primary" />
                )}
            </div>

            {(onRestart || historyHref) && (
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                    {onRestart && (
                        <AppButton onClick={onRestart} icon={<LuRefreshCw size={20} aria-hidden />}>
                            Qayta boshlash
                        </AppButton>
                    )}
                    {historyHref && (
                        <AppButton variant="outline" href={historyHref} icon={<LuHistory size={20} aria-hidden />}>
                            Natijalar tarixi
                        </AppButton>
                    )}
                </div>
            )}
        </div>
    );
};

export default TypingResultView;
