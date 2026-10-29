'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LuCamera, LuExternalLink, LuFlame, LuKeyRound, LuLogOut, LuPencil, LuTrash2, LuUserCircle } from 'react-icons/lu';
import clsx from 'clsx';

import { accountErrorMessage, changePassword, requestPasswordReset, updateAvatar, updateName } from '@/lib/app/account';
import { formatDate } from '@/lib/app/format';
import { computeStreak, History } from '@/lib/app/history';
import { TypingSample } from '@/lib/app/typing/engine';
import { isTrustedTypingResult } from '@/lib/app/typing/result';
import { useAuth } from '../auth/AuthProvider';
import DashboardPage from '../DashboardPage';
import { FormError, TextField } from '../form';
import Avatar from '../shell/Avatar';
import TypingChart from '../typing/TypingChart';
import { AppButton, cardClass, EmptyState, Spinner, StatTile } from '../ui';
import { useHistory } from '../useHistory';

/** Grafikda ko'rsatiladigan oxirgi mashqlar soni. */
const CHART_LIMIT = 60;
/** O'rtacha chiziq shuncha mashq bo'yicha hisoblanadi. */
const ROLLING = 5;

/** Mashqlar bo'yicha WPM o'sishi: har bir nuqta — bitta mashq, kulrang chiziq — sirpanuvchi o'rtacha. */
const growthSamples = (history: History): TypingSample[] => {
    const results = history.typing.slice(0, CHART_LIMIT).reverse();
    return results.map((result, i) => {
        const window = results.slice(Math.max(0, i - ROLLING + 1), i + 1);
        return {
            second: i + 1,
            wpm: result.wpm,
            raw: window.reduce((sum, r) => sum + r.wpm, 0) / window.length,
            errors: 0,
        };
    });
};

/** Profil: ism, ko'rsatkichlar, ketma-ket kunlar, WPM o'sishi va parol. */
const ProfileView: React.FC = () => {
    const { account, ready, openSignIn, signOut } = useAuth();
    const history = useHistory();

    if (!ready) return <Spinner className="flex-1" />;
    if (!account) {
        return (
            <DashboardPage title="Profil">
                <EmptyState icon={<LuUserCircle aria-hidden />} text="Profilni köriş uçun hisobingizga kiring">
                    <AppButton onClick={openSignIn}>Kiriş</AppButton>
                </EmptyState>
            </DashboardPage>
        );
    }

    const streak = history ? computeStreak(history) : null;
    const typing = history?.typing ?? [];
    const works = history?.works ?? [];
    const bestWpm = Math.max(0, ...typing.filter(isTrustedTypingResult).map(r => r.wpm));
    const averageBaho = works.length ? works.reduce((sum, w) => sum + w.baho, 0) / works.length : 0;
    const tileClass = 'w-auto';

    return (
        <DashboardPage
            title="Profil"
            actions={
                <AppButton variant="danger" onClick={signOut} icon={<LuLogOut size={18} aria-hidden />} className="!min-h-[40px]">
                    Çiqiş
                </AppButton>
            }
        >
            <NameCard key={account.id} />

            {!history ? (
                <Spinner className="py-12" />
            ) : (
                <>
                    {streak && (
                        <div
                            className={clsx(
                                cardClass,
                                'mt-4 flex items-center gap-4 p-5',
                                streak.current > 0 && 'bg-gradient-to-r from-tertiary/30 to-white'
                            )}
                        >
                            <LuFlame
                                size={36}
                                className={streak.current > 0 ? 'text-[#F97316]' : 'text-muted/40'}
                                aria-hidden
                            />
                            <div className="flex-1">
                                <p className="font-heading text-xl font-bold">
                                    {streak.current > 0 ? `${streak.current} kun ketma-ket` : 'Ketma-ketlik yöq'}
                                </p>
                                <p className="text-sm text-muted">
                                    {streak.activeToday
                                        ? 'Bugungi maşq bajarildi — ertaga ham davom eting!'
                                        : streak.current > 0
                                          ? 'Bugun maşq qilmasangiz, ketma-ketlik uziladi.'
                                          : 'Har kuni kamida bitta maşq yoki diktant bajaring.'}
                                    {streak.best > 0 && ` Eng uzun: ${streak.best} kun.`}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatTile className={tileClass} label="Eng yaxşi (WPM)" value={`${Math.round(bestWpm)}`} valueClassName="text-primary" />
                        <StatTile className={tileClass} label="Maşqlar" value={`${typing.length} ta`} />
                        <StatTile className={tileClass} label="Diktantlar" value={`${works.length} ta`} />
                        <StatTile
                            className={tileClass}
                            label="Örtaça baho"
                            value={works.length ? averageBaho.toFixed(1) : '—'}
                        />
                    </div>

                    <section className={clsx(cardClass, 'mt-4 p-5')}>
                        <h2 className="font-heading text-lg font-semibold">Tezlik ösişi</h2>
                        <p className="mt-0.5 text-xs text-muted">
                            Oxirgi {Math.min(CHART_LIMIT, typing.length)} ta maşq · kulrang çiziq — oxirgi {ROLLING} ta maşq
                            örtaçasi
                        </p>
                        <div className="mt-4 h-[220px]">
                            <TypingChart
                                samples={growthSamples(history)}
                                xLabel={value => `${value}-mashq`}
                                emptyText="Grafik uçun kamida 2 ta tez yoziş maşqi kerak"
                            />
                        </div>
                    </section>
                </>
            )}

            <PasswordCard />
        </DashboardPage>
    );
};

const NameCard: React.FC = () => {
    const { account } = useAuth();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(account?.name ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!account) return null;

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!name.trim()) return;
        setBusy(true);
        setError(null);
        try {
            await updateName(account.id, name);
            setEditing(false);
        } catch (e) {
            setError(accountErrorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className={clsx(cardClass, 'mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center')}>
            <AvatarPicker />
            {editing ? (
                <form onSubmit={save} className="flex flex-1 flex-col gap-3">
                    <TextField
                        id="profile-name"
                        label="Ism (reytingda körinadi)"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        maxLength={60}
                        autoFocus
                        required
                    />
                    <FormError message={error} />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={busy}
                            className="inline-flex min-h-[40px] items-center rounded-full bg-brand-gradient px-5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
                        >
                            {busy ? 'Saqlanmoqda…' : 'Saqlaş'}
                        </button>
                        <AppButton variant="ghost" className="!min-h-[40px]" onClick={() => setEditing(false)}>
                            Bekor qiliş
                        </AppButton>
                    </div>
                </form>
            ) : (
                <>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-heading text-xl font-bold">{account.name}</p>
                        <p className="truncate text-sm text-muted">{account.email}</p>
                        {account.createdAt && (
                            <p className="mt-1 font-mono text-[11px] text-muted">
                                A’zo bölgan: {formatDate(account.createdAt).split(',')[0]}
                            </p>
                        )}
                        <Link
                            href={`/app/foydalanuvchi/${account.id}`}
                            className="mt-1 inline-flex items-center gap-1 text-sm text-primary underline-offset-2 hover:underline"
                        >
                            <LuExternalLink size={14} aria-hidden />
                            Boşqalar köradigan profil
                        </Link>
                    </div>
                    <AppButton
                        variant="outline"
                        className="!min-h-[40px]"
                        icon={<LuPencil size={16} aria-hidden />}
                        onClick={() => {
                            setName(account.name);
                            setEditing(true);
                        }}
                    >
                        Ismni özgartiriş
                    </AppButton>
                </>
            )}
        </section>
    );
};

/** Profil rasmi: bosilsa fayl tanlanadi; rasm bo'lsa — o'chirish tugmasi. */
const AvatarPicker: React.FC = () => {
    const { account } = useAuth();
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!account) return null;

    const save = async (file: File | null) => {
        if (file && !file.type.startsWith('image/')) {
            setError('Faqat rasm tanlang (JPG, PNG yoki WEBP)');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            await updateAvatar(account.id, file);
        } catch (e) {
            setError(e instanceof Error && !('status' in e) ? e.message : accountErrorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-center">
            <button
                type="button"
                disabled={busy}
                onClick={() => input.current?.click()}
                aria-label="Profil rasmini tanlaş"
                className="group relative rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
                <Avatar account={account} className={clsx('!h-20 !w-20 !text-3xl', busy && 'opacity-50')} />
                <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-glow transition-transform group-hover:scale-110">
                    {busy ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                        <LuCamera size={15} aria-hidden />
                    )}
                </span>
            </button>
            <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={event => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) save(file);
                }}
            />
            {account.avatarUrl && !busy && (
                <button
                    type="button"
                    onClick={() => save(null)}
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-danger"
                >
                    <LuTrash2 size={12} aria-hidden />
                    Rasmni öçiriş
                </button>
            )}
            {error && <p className="max-w-[200px] text-xs text-danger-deep">{error}</p>}
        </div>
    );
};

const PasswordCard: React.FC = () => {
    const { account } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

    useEffect(() => setMessage(null), [account?.id]);

    if (!account) return null;

    const run = async (action: () => Promise<unknown>, success: string) => {
        setBusy(true);
        setMessage(null);
        try {
            await action();
            setMessage({ ok: true, text: success });
            setOldPassword('');
            setPassword('');
        } catch (e) {
            setMessage({ ok: false, text: accountErrorMessage(e) });
        } finally {
            setBusy(false);
        }
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        run(() => changePassword(account, oldPassword, password), 'Parol almaştirildi');
    };

    return (
        <section className={clsx(cardClass, 'mt-4 p-5')}>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                <LuKeyRound size={18} className="text-primary" aria-hidden />
                Parol
            </h2>
            <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
                <TextField
                    id="old-password"
                    label="Joriy parol"
                    type="password"
                    autoComplete="current-password"
                    value={oldPassword}
                    onChange={event => setOldPassword(event.target.value)}
                    required
                />
                <TextField
                    id="new-password"
                    label="Yangi parol"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    required
                />
                {message &&
                    (message.ok ? (
                        <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success sm:col-span-2">
                            {message.text}
                        </p>
                    ) : (
                        <div className="sm:col-span-2">
                            <FormError message={message.text} />
                        </div>
                    ))}
                <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                    <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex min-h-[44px] items-center rounded-full bg-brand-gradient px-6 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
                    >
                        Parolni almaştiriş
                    </button>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                            run(
                                () => requestPasswordReset(account.email),
                                `Parolni tiklaş havolasi ${account.email} manziliga yuborildi`
                            )
                        }
                        className="text-sm text-primary underline-offset-2 hover:underline disabled:opacity-60"
                    >
                        Parolni bilmayman — emailga havola yuboriş
                    </button>
                </div>
            </form>
        </section>
    );
};

export default ProfileView;
