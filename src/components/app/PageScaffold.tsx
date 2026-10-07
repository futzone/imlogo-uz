import clsx from 'clsx';
import { LuArrowLeft } from 'react-icons/lu';

import { IconButton } from './ui';

interface Props {
    title: string;
    /** Orqaga tugmasi: havola (`backHref`) yoki amal (`onBack`). */
    backHref?: string;
    onBack?: () => void;
    actions?: React.ReactNode;
    className?: string;
}

/**
 * Ichki sahifalar uchun umumiy qolip: orqaga tugmasi bo'lgan shisha sarlavha
 * va markazlashtirilgan, kengligi cheklangan kontent.
 */
const PageScaffold: React.FC<React.PropsWithChildren<Props>> = ({
    title,
    backHref = '/app',
    onBack,
    actions,
    className,
    children,
}) => (
    <div className="mx-auto flex min-h-dvh w-full max-w-[960px] flex-col">
        <header className="sticky top-0 z-40 px-4 pt-3 sm:px-6">
            <div className="glass flex items-center gap-1 rounded-full px-2 py-1.5 shadow-glow-soft">
                <IconButton
                    icon={<LuArrowLeft size={20} aria-hidden />}
                    tooltip="Orqaga"
                    href={onBack ? undefined : backHref}
                    onClick={onBack}
                />
                <h1 className="min-w-0 flex-1 truncate font-heading text-base font-semibold sm:text-lg">{title}</h1>
                {actions}
                <span className="w-2" />
            </div>
        </header>
        <main className={clsx('flex flex-1 flex-col px-4 pb-6 pt-5 sm:px-6', className)}>{children}</main>
    </div>
);

export default PageScaffold;
