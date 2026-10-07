const two = (value: number) => value.toString().padStart(2, '0');

/** Soniyalarni `mm:ss` ko'rinishiga keltiradi. */
export const formatTime = (seconds: number): string => {
    const safe = Math.max(0, Math.floor(seconds));
    return `${two(Math.floor(safe / 60))}:${two(safe % 60)}`;
};

/** ISO sanani `yyyy.mm.dd, hh:mm` ko'rinishiga keltiradi (mahalliy vaqt). */
export const formatDate = (iso: string | null | undefined): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}.${two(d.getMonth() + 1)}.${two(d.getDate())}, ${two(d.getHours())}:${two(d.getMinutes())}`;
};

/** 5 ballik baho rangi. */
export const rateColor = (rate: number): string => {
    if (rate === 0) return '#000000';
    if (rate === 1) return '#795548';
    if (rate === 2) return '#F44336';
    if (rate === 3) return '#FFC107';
    if (rate === 4) return '#2196F3';
    return '#4CAF50';
};
