import clsx from 'clsx';

interface Props {
    className?: string;
    /** Shaffof "shisha" ko'rinish (fon naqshi ustida suzuvchi kartalar uchun) */
    glass?: boolean;
    /** Burchaklardagi binafsha aksent chiziqlar ("tanlangan tugun" effekti) */
    corners?: boolean;
    /** Hover holatida ko'tarilish va glow */
    interactive?: boolean;
}

const Card: React.FC<React.PropsWithChildren<Props>> = ({
    className,
    glass,
    corners,
    interactive = true,
    children,
}) => {
    return (
        <div
            className={clsx(
                'group relative rounded-2xl border border-line p-6 md:p-8 transition-all duration-300',
                glass ? 'bg-white/70 backdrop-blur-lg' : 'bg-white',
                interactive &&
                    'hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow-card',
                className
            )}
        >
            {corners && (
                <>
                    <span
                        aria-hidden
                        className="pointer-events-none absolute -left-px -top-px h-5 w-5 rounded-tl-2xl border-l-2 border-t-2 border-primary"
                    />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute -bottom-px -right-px h-5 w-5 rounded-br-2xl border-b-2 border-r-2 border-primary"
                    />
                </>
            )}
            {children}
        </div>
    );
};

export default Card;
