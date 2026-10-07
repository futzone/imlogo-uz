import clsx from 'clsx';

interface Props {
    className?: string;
    /** Chap tomonda "jonli" pulsatsiyalanuvchi nuqta */
    pulse?: boolean;
    tone?: 'primary' | 'success';
}

const Badge: React.FC<React.PropsWithChildren<Props>> = ({ className, pulse, tone = 'primary', children }) => {
    return (
        <span
            className={clsx(
                'inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-widest sm:text-xs',
                tone === 'success'
                    ? 'border-success/25 bg-success/5 text-success'
                    : 'border-primary/25 bg-primary/5 text-primary',
                className
            )}
        >
            {pulse && (
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                </span>
            )}
            {children}
        </span>
    );
};

export default Badge;
