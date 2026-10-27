import { TypingSample } from '@/lib/app/typing/engine';

/**
 * Mashq davomidagi tezlik grafigi: WPM (gradient chiziq), xom tezlik
 * (kulrang chiziq) va xato qilingan soniyalar (qizil nuqtalar).
 */
const TypingChart: React.FC<{
    samples: TypingSample[];
    /** X o'qi yorlig'i (standart — soniyalar). */
    xLabel?: (value: number) => string;
    emptyText?: string;
}> = ({ samples, xLabel = value => `${value}s`, emptyText = 'Grafik uçun maşq juda qisqa böldi' }) => {
    if (samples.length < 2) {
        return (
            <p className="flex h-full items-center justify-center text-center font-mono text-xs font-medium text-muted">
                {emptyText}
            </p>
        );
    }

    const peak = Math.max(...samples.map(s => Math.max(s.wpm, s.raw)));
    const maxY = Math.max(20, Math.ceil((peak * 1.15) / 10) * 10);

    // Chizma 100×100 birlikli maydonda quriladi va konteynerga cho'ziladi.
    const xFor = (i: number) => (100 * i) / (samples.length - 1);
    const yFor = (value: number) => 100 - 100 * Math.min(1, Math.max(0, value / maxY));
    const lineOf = (value: (s: TypingSample) => number) =>
        samples.map((s, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(2)} ${yFor(value(s)).toFixed(2)}`).join(' ');

    const wpmLine = lineOf(s => s.wpm);
    const labelClass = 'absolute font-mono text-[10px] font-medium leading-none text-muted';

    return (
        <div
            className="relative h-full w-full"
            role="img"
            aria-label={`Tezlik grafigi: ${samples.length} nuqta, eng yuqori körsatkiç ${Math.round(peak)} WPM`}
        >
            {[0, 1, 2].map(step => (
                <span
                    key={step}
                    className={`${labelClass} left-0 w-[26px] -translate-y-1/2 text-right`}
                    style={{ top: `calc(8px + (100% - 28px) * ${1 - step / 2})` }}
                >
                    {Math.round((maxY * step) / 2)}
                </span>
            ))}
            <span className={`${labelClass} bottom-0 left-[34px]`}>{xLabel(samples[0].second)}</span>
            <span className={`${labelClass} bottom-0 right-0`}>{xLabel(samples[samples.length - 1].second)}</span>

            <div className="absolute bottom-5 left-[34px] right-0 top-2">
                {[0, 50, 100].map(top => (
                    <span key={top} className="absolute inset-x-0 border-t border-line" style={{ top: `${top}%` }} />
                ))}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
                    <defs>
                        <linearGradient id="typing-chart-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="var(--primary)" stopOpacity="0.22" />
                            <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="typing-chart-line" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0">
                            <stop offset="0" stopColor="var(--primary)" />
                            <stop offset="1" stopColor="var(--secondary)" />
                        </linearGradient>
                    </defs>
                    <path
                        d={lineOf(s => s.raw)}
                        fill="none"
                        stroke="rgb(var(--muted-rgb) / 0.35)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                    <path d={`${wpmLine} L100 100 L0 100 Z`} fill="url(#typing-chart-area)" />
                    <path
                        d={wpmLine}
                        fill="none"
                        stroke="url(#typing-chart-line)"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
                {samples.map(
                    (sample, i) =>
                        sample.errors > 0 && (
                            <span
                                key={sample.second}
                                className="absolute bottom-0 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-danger"
                                style={{ left: `${xFor(i)}%` }}
                            />
                        )
                )}
            </div>
        </div>
    );
};

export default TypingChart;
