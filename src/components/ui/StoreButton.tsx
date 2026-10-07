import clsx from 'clsx';

interface Props {
    href: string;
    label: string;
    icon: React.ReactNode;
    /** To'q fonli variant (och fon ustida), aks holda och "shisha" variant */
    dark?: boolean;
}

const StoreButton: React.FC<Props> = ({ href, label, icon, dark }) => {
    return (
        <a
            href={href}
            className={clsx(
                'flex h-14 w-full min-w-[205px] items-center justify-center rounded-full px-6 transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-fit',
                dark
                    ? 'bg-foreground text-white shadow-glow hover:shadow-glow-lg'
                    : 'border border-line bg-white text-foreground hover:border-primary/50 hover:shadow-glow-card'
            )}
        >
            <span className="mr-3 flex w-[30px] justify-center">{icon}</span>
            <span className="text-left">
                <span className="block font-mono text-[10px] uppercase tracking-widest opacity-80">
                    Yuklab oling
                </span>
                <span className="-mt-0.5 block font-heading text-lg font-semibold leading-tight">
                    {label}
                </span>
            </span>
        </a>
    );
};

export default StoreButton;
