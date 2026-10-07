import clsx from 'clsx';

/** Fon uchun katta, yumshoq rangli yorug'lik dog'i */
const GlowBlob: React.FC<{ className?: string }> = ({ className }) => (
    <div
        aria-hidden
        className={clsx('pointer-events-none absolute rounded-full blur-[120px]', className)}
    />
);

export default GlowBlob;
