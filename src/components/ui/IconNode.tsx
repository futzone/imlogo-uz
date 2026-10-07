import clsx from 'clsx';

/** Ikonka uchun yorug'lanuvchi "tugun" konteyneri */
const IconNode: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => {
    return (
        <span
            className={clsx(
                'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-shadow duration-300 group-hover:shadow-glow',
                className
            )}
        >
            {children}
        </span>
    );
};

export default IconNode;
