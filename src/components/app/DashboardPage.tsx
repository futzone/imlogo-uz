import clsx from 'clsx';

interface Props {
    title: string;
    subtitle?: React.ReactNode;
    /** Sarlavha yonidagi amallar (keng ekranda o'ngda). */
    actions?: React.ReactNode;
    className?: string;
}

/** Dashboard ichidagi sahifa: sarlavha, izoh va kengligi cheklangan kontent. */
const DashboardPage: React.FC<React.PropsWithChildren<Props>> = ({ title, subtitle, actions, className, children }) => (
    <div className={clsx('mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-4 pb-10 pt-6 sm:px-6 lg:pt-8', className)}>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                <h1 className="font-heading text-2xl font-bold sm:text-[32px]">{title}</h1>
                {subtitle && <p className="mt-1.5 max-w-2xl text-[15px] text-muted">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
        {children}
    </div>
);

export default DashboardPage;
