'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import {
    LuChevronDown,
    LuFlame,
    LuFileText,
    LuHeadphones,
    LuHistory,
    LuInfo,
    LuKeyboard,
    LuLanguages,
    LuLogIn,
    LuLogOut,
    LuMessageSquare,
    LuSmartphone,
    LuSparkles,
    LuUsers,
} from 'react-icons/lu';

import Logo from '@/components/Logo';
import CelebrationBadge from '@/components/celebration/CelebrationBadge';
import { computeStreak } from '@/lib/app/history';
import { useAuth } from '../auth/AuthProvider';
import { useHistory } from '../useHistory';
import Avatar from './Avatar';

interface NavLink {
    label: string;
    href: string;
    icon?: React.ReactNode;
    /** Berilsa, shu manzil bilan boshlanadigan barcha sahifalarda havola faol. */
    prefix?: string;
}

interface NavGroup {
    label: string;
    icon: React.ReactNode;
    /** Shu manzil bilan boshlanadigan sahifalarda guruh ochiq turadi. */
    prefix: string;
    children: NavLink[];
}

type NavItem = NavLink | NavGroup;

const nav: NavItem[] = [
    { label: 'Tez yoziş', href: '/app/tez-yozish', icon: <LuKeyboard size={19} aria-hidden /> },
    { label: 'Hamjamiyat', href: '/app/hamjamiyat', icon: <LuUsers size={19} aria-hidden /> },
    { label: 'Diktant', href: '/app', icon: <LuHeadphones size={19} aria-hidden /> },
    // Yo'nalish sahifaning o'zida tanlanadi — yon panelda bitta havola yetarli.
    { label: 'Translator', href: '/app/translator', icon: <LuLanguages size={19} aria-hidden />, prefix: '/app/translator' },
    {
        label: 'Loyiha haqida',
        icon: <LuInfo size={19} aria-hidden />,
        prefix: '/app/loyiha',
        children: [
            { label: 'Loyiha haqida', href: '/app/loyiha', icon: <LuSparkles size={16} aria-hidden /> },
            { label: 'Loyiha docs', href: '/qollanma', icon: <LuFileText size={16} aria-hidden /> },
            { label: 'Ilovalarimiz', href: '/app/loyiha/ilovalar', icon: <LuSmartphone size={16} aria-hidden /> },
        ],
    },
];

const isGroup = (item: NavItem): item is NavGroup => 'children' in item;

const isActive = (link: NavLink, pathname: string) =>
    link.prefix ? pathname.startsWith(link.prefix) : pathname === link.href;

const linkClass = (active: boolean) =>
    clsx(
        'flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors duration-200',
        active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-primary/5 hover:text-primary'
    );

/** Yon panel mazmuni: keng ekranda doimiy, telefonda — chiqib keladigan oyna ichida. */
const AppSidebar: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 px-5 pb-4 pt-5">
                <Link href="/" onClick={onNavigate} className="flex items-center" aria-label="Imlo Go — boş sahifa">
                    <Logo className="h-[22px]" />
                </Link>
                <CelebrationBadge compact className="ml-auto" />
            </div>

            <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Bölimlar">
                <ul className="flex flex-col gap-0.5">
                    {nav.map(item =>
                        isGroup(item) ? (
                            <SidebarGroup key={item.label} group={item} pathname={pathname} onNavigate={onNavigate} />
                        ) : (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
                                    aria-current={isActive(item, pathname) ? 'page' : undefined}
                                    className={linkClass(isActive(item, pathname))}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            </li>
                        )
                    )}
                </ul>
            </nav>

            <SidebarAccount pathname={pathname} onNavigate={onNavigate} />
        </div>
    );
};

const SidebarGroup: React.FC<{ group: NavGroup; pathname: string; onNavigate?: () => void }> = ({
    group,
    pathname,
    onNavigate,
}) => {
    const inside = pathname.startsWith(group.prefix);
    const [open, setOpen] = useState(inside);
    const expanded = open || inside;

    return (
        <li>
            <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(!expanded)}
                className={clsx(linkClass(false), 'w-full', inside && '!text-primary')}
            >
                {group.icon}
                <span className="flex-1 text-left">{group.label}</span>
                <LuChevronDown
                    size={16}
                    aria-hidden
                    className={clsx('text-muted transition-transform duration-200', expanded && 'rotate-180')}
                />
            </button>
            {expanded && (
                <ul className="mb-1 ml-[21px] mt-0.5 flex flex-col gap-0.5 border-l border-line pl-3">
                    {group.children.map(child => {
                        const active = pathname === child.href;
                        return (
                            <li key={child.href}>
                                <Link
                                    href={child.href}
                                    onClick={onNavigate}
                                    aria-current={active ? 'page' : undefined}
                                    className={clsx(linkClass(active), '!min-h-[38px] gap-2.5 !text-sm')}
                                >
                                    {child.icon}
                                    {child.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </li>
    );
};

/** Panel pastidagi blok: hisob, natijalar va murojaat. */
const SidebarAccount: React.FC<{ pathname: string; onNavigate?: () => void }> = ({ pathname, onNavigate }) => {
    const { account, ready, openSignIn, openFeedback, signOut } = useAuth();
    const history = useHistory();
    const streak = history ? computeStreak(history).current : 0;
    const action = (fn: () => void) => () => {
        onNavigate?.();
        fn();
    };

    return (
        <div className="border-t border-line px-3 pb-4 pt-3">
            <Link
                href="/app/natijalar"
                onClick={onNavigate}
                aria-current={pathname === '/app/natijalar' ? 'page' : undefined}
                className={linkClass(pathname === '/app/natijalar')}
            >
                <LuHistory size={19} aria-hidden />
                Natijalarim
            </Link>
            <button type="button" onClick={action(openFeedback)} className={clsx(linkClass(false), 'w-full')}>
                <LuMessageSquare size={19} aria-hidden />
                Murojaat qoldiriş
            </button>

            <div className="mt-3 min-h-[64px]">
                {!ready ? null : account ? (
                    <div
                        className={clsx(
                            'flex items-center gap-2 rounded-2xl border bg-white/70 p-2.5',
                            pathname === '/app/profil' ? 'border-primary/50' : 'border-line'
                        )}
                    >
                        <Link
                            href="/app/profil"
                            onClick={onNavigate}
                            title="Profil"
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl hover:text-primary"
                        >
                            <Avatar account={account} />
                            <span className="min-w-0 flex-1 leading-tight">
                                <span className="block truncate text-sm font-semibold">{account.name}</span>
                                <span className="block truncate text-xs text-muted">{account.email}</span>
                            </span>
                        </Link>
                        {streak > 0 && (
                            <span
                                title={`${streak} kun ketma-ket`}
                                className="inline-flex shrink-0 items-center gap-0.5 font-mono text-xs font-semibold text-[#F97316]"
                            >
                                <LuFlame size={16} aria-hidden />
                                {streak}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={action(signOut)}
                            title="Çiqiş"
                            aria-label="Hisobdan çiqiş"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
                        >
                            <LuLogOut size={18} aria-hidden />
                        </button>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
                        <p className="text-xs leading-snug text-muted">
                            Kirsangiz, natijalaringiz saqlanadi va reytingda qatnaşasiz.
                        </p>
                        <button
                            type="button"
                            onClick={action(openSignIn)}
                            className="mt-2.5 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full bg-brand-gradient text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-lg"
                        >
                            <LuLogIn size={16} aria-hidden />
                            Kiriş
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppSidebar;
