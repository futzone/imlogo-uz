import Link from 'next/link';
import clsx from 'clsx';

type Variant = 'primary' | 'outline' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

const variants: Record<Variant, string> = {
    primary:
        'bg-brand-gradient text-white uppercase tracking-wider shadow-glow hover:scale-105 hover:shadow-glow-lg',
    outline:
        'border-2 border-primary/25 text-foreground hover:border-primary hover:bg-primary/5',
    ghost: 'text-foreground hover:bg-primary/10 hover:text-primary',
    link: 'text-primary hover:underline !rounded-none',
};

const sizes: Record<Size, string> = {
    sm: 'min-h-[44px] px-5 text-xs',
    md: 'min-h-[44px] px-6 text-sm',
    lg: 'min-h-[52px] px-8 text-sm md:text-base',
};

interface Props {
    href: string;
    variant?: Variant;
    size?: Size;
    className?: string;
    onClick?: () => void;
}

const Button: React.FC<React.PropsWithChildren<Props>> = ({
    href,
    variant = 'primary',
    size = 'md',
    className,
    onClick,
    children,
}) => {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={clsx(base, variants[variant], variant !== 'link' && sizes[size], className)}
        >
            {children}
        </Link>
    );
};

export default Button;
