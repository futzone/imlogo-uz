import Link from 'next/link';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

const buttonBase =
    'inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full px-6 py-2.5 text-center font-body text-sm font-semibold leading-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

const buttonVariants: Record<ButtonVariant, string> = {
    primary: 'bg-brand-gradient uppercase tracking-wider text-white shadow-glow hover:scale-[1.04] hover:shadow-glow-lg',
    outline: 'border-2 border-primary/25 text-foreground hover:border-primary hover:bg-primary/5',
    ghost: 'text-foreground hover:bg-primary/10 hover:text-primary',
    danger: 'border-2 border-danger/50 text-danger hover:border-danger hover:bg-danger/5',
};

interface AppButtonProps {
    variant?: ButtonVariant;
    /** Berilsa, tugma havola bo'ladi (tashqi manzil yangi oynada ochiladi). */
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    expand?: boolean;
    className?: string;
}

/**
 * Pill shaklidagi tugma. `primary` — gradient va yorug'lik bilan,
 * `outline` — chegarali, `ghost` — fonsiz, `danger` — qizil chegarali.
 */
export const AppButton: React.FC<React.PropsWithChildren<AppButtonProps>> = ({
    variant = 'primary',
    href,
    onClick,
    icon,
    trailingIcon,
    expand,
    className,
    children,
}) => {
    const classes = clsx(buttonBase, buttonVariants[variant], expand && 'w-full', className);
    const content = (
        <>
            {icon}
            <span>{children}</span>
            {trailingIcon}
        </>
    );

    if (href === undefined) {
        return (
            <button type="button" onClick={onClick} className={classes}>
                {content}
            </button>
        );
    }
    if (/^https?:/.test(href)) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={classes}>
                {content}
            </a>
        );
    }
    // Yuklab olish yo'nalishlari sahifa emas — oddiy havola.
    if (href.startsWith('mailto:') || href.startsWith('/yuklab-olish/')) {
        return (
            <a href={href} onClick={onClick} className={classes}>
                {content}
            </a>
        );
    }
    return (
        <Link href={href} onClick={onClick} className={classes}>
            {content}
        </Link>
    );
};

interface IconButtonProps {
    icon: React.ReactNode;
    /** Ikonka tavsifi; `label` ko'rsatilmaganda tooltip sifatida ham chiqadi. */
    tooltip: string;
    /** Keng ekranda ikonka yonida ko'rsatiladigan matn. */
    label?: string;
    href?: string;
    onClick?: () => void;
}

/** Dumaloq ikonka-tugma (sarlavha panelida ishlatiladi). */
export const IconButton: React.FC<IconButtonProps> = ({ icon, tooltip, label, href, onClick }) => {
    const classes =
        'inline-flex h-11 min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-full text-sm font-medium text-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary xl:data-[labeled]:px-3.5';
    const content = (
        <>
            {icon}
            {label && <span className="hidden xl:inline">{label}</span>}
        </>
    );
    const shared = { className: classes, title: tooltip, 'aria-label': tooltip, 'data-labeled': label ? '' : undefined };

    return href ? (
        <Link href={href} {...shared}>
            {content}
        </Link>
    ) : (
        <button type="button" onClick={onClick} {...shared}>
            {content}
        </button>
    );
};

/** Asosiy karta ko'rinishi: 1px chegara, 16px radius. */
export const cardClass = 'rounded-2xl border border-line bg-white';

/** Bosiladigan karta: hover holatida biroz ko'tariladi va yorug'lanadi. */
export const interactiveCardClass = clsx(
    cardClass,
    'block w-full text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow-card'
);

/** Burchaklardagi binafsha aksent chiziqlar (ota element `relative` bo'lishi kerak). */
export const CornerAccents: React.FC = () => (
    <>
        <span
            aria-hidden
            className="pointer-events-none absolute -left-px -top-px h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-primary"
        />
        <span
            aria-hidden
            className="pointer-events-none absolute -bottom-px -right-px h-6 w-6 rounded-br-2xl border-b-2 border-r-2 border-primary"
        />
    </>
);

interface StatTileProps {
    label: string;
    value: string;
    hint?: string;
    className?: string;
    valueClassName?: string;
}

/** Kichik statistik katak: tepada mono yorliq, pastda qiymat. */
export const StatTile: React.FC<StatTileProps> = ({
    label,
    value,
    hint,
    className = 'w-[150px]',
    valueClassName,
}) => (
    <div title={hint} className={clsx(cardClass, 'px-4 py-3.5', className)}>
        <p className="font-mono text-[10px] font-medium uppercase leading-normal tracking-[0.14em] text-muted">
            {label}
        </p>
        <p className={clsx('mt-1.5 truncate font-mono text-[22px] font-medium leading-tight', valueClassName)}>
            {value}
        </p>
    </div>
);

/** Mono shriftdagi kichik ma'lumot bo'lagi: ikonka + matn. */
export const MetaChip: React.FC<React.PropsWithChildren<{ icon: React.ReactNode }>> = ({ icon, children }) => (
    <span className="inline-flex items-start gap-1.5 font-mono text-xs font-medium text-muted">
        <span className="mt-px shrink-0 text-base">{icon}</span>
        <span>{children}</span>
    </span>
);

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <div className={clsx('flex items-center justify-center p-6', className)} role="status" aria-label="Yuklanmoqda">
        <span className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
);

interface EmptyStateProps {
    icon: React.ReactNode;
    text: string;
    tone?: 'primary' | 'danger';
}

/** Bo'sh yoki xatolik holati: ikonka, matn va (ixtiyoriy) amal. */
export const EmptyState: React.FC<React.PropsWithChildren<EmptyStateProps>> = ({
    icon,
    text,
    tone = 'primary',
    children,
}) => (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span
            className={clsx(
                'inline-flex h-11 w-11 items-center justify-center rounded-xl border text-[22px]',
                tone === 'danger'
                    ? 'border-danger/30 bg-danger/10 text-danger'
                    : 'border-primary/30 bg-primary/10 text-primary'
            )}
        >
            {icon}
        </span>
        <p className="max-w-md text-[15px] text-muted">{text}</p>
        {children}
    </div>
);
