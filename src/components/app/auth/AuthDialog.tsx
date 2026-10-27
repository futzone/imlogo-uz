'use client';

import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { LuCheck, LuX } from 'react-icons/lu';

import { accountErrorMessage, requestPasswordReset, signIn, signInWithGoogle, signUp } from '@/lib/app/account';
import { FormError, Segmented, TextField } from '../form';
import { Modal, ModalTitle } from '../Overlay';
import { AppButton } from '../ui';

type Mode = 'signIn' | 'signUp';

const benefits = [
    'Tez yoziş natijalaringiz istalgan qurilmada saqlanadi',
    'Hamjamiyat reytingida boşqalar bilan bellaşasiz',
    'Xatolik yoki taklif haqida murojaat qoldirasiz',
];

/** Kirish / ro'yxatdan o'tish oynasi: Google yoki email va parol orqali. */
const AuthDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const [mode, setMode] = useState<Mode>('signIn');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setError(null);
            setNotice(null);
            setPassword('');
        }
    }, [open]);

    const run = async (action: () => Promise<unknown>) => {
        setBusy(true);
        setError(null);
        try {
            await action();
            onClose();
        } catch (e) {
            setError(accountErrorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (mode === 'signUp' && !name.trim()) {
            setError('Ismingizni kiriting — u reytingda körinadi');
            return;
        }
        run(() => (mode === 'signIn' ? signIn(email, password) : signUp(name, email, password)));
    };

    return (
        <Modal open={open} onClose={onClose} className="relative max-w-[440px]">
            <button
                type="button"
                onClick={onClose}
                aria-label="Yopiş"
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-primary/10 hover:text-primary"
            >
                <LuX size={20} aria-hidden />
            </button>
            <ModalTitle className="pr-8 font-heading text-2xl font-bold">
                {mode === 'signIn' ? 'Hisobga kiriş' : 'Röyxatdan ötiş'}
            </ModalTitle>
            <p className="mt-1 text-sm text-muted">Majburiy emas — ilovadan mehmon sifatida ham töliq foydalaniş mumkin.</p>
            <ul className="mt-4 space-y-1.5">
                {benefits.map(benefit => (
                    <li key={benefit} className="flex items-start gap-2 text-sm">
                        <LuCheck size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
                        {benefit}
                    </li>
                ))}
            </ul>

            <AppButton
                variant="outline"
                expand
                className="mt-5"
                icon={<FcGoogle size={20} aria-hidden />}
                onClick={() => !busy && run(signInWithGoogle)}
            >
                Google orqali kiriş
            </AppButton>

            <div className="my-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                <span className="h-px flex-1 bg-line" />
                yoki email orqali
                <span className="h-px flex-1 bg-line" />
            </div>

            <Segmented
                className="mb-4 flex w-full"
                value={mode}
                onChange={next => {
                    setMode(next);
                    setError(null);
                }}
                options={[
                    { value: 'signIn', label: 'Kiriş' },
                    { value: 'signUp', label: 'Röyxatdan ötiş' },
                ]}
            />

            <form onSubmit={submit} className="flex flex-col gap-3">
                {mode === 'signUp' && (
                    <TextField
                        id="auth-name"
                        label="Ism"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        autoComplete="name"
                        maxLength={60}
                        required
                    />
                )}
                <TextField
                    id="auth-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                />
                <TextField
                    id="auth-password"
                    label="Parol"
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                    minLength={8}
                    required
                />
                {mode === 'signIn' && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                            if (!email.trim()) {
                                setError('Avval email manzilingizni kiriting');
                                return;
                            }
                            setError(null);
                            try {
                                await requestPasswordReset(email);
                                setNotice(`Parolni tiklaş havolasi ${email.trim()} manziliga yuborildi`);
                            } catch (e) {
                                setError(accountErrorMessage(e));
                            }
                        }}
                        className="self-end text-sm text-primary underline-offset-2 hover:underline"
                    >
                        Parolni unutdingizmi?
                    </button>
                )}
                {notice && (
                    <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">{notice}</p>
                )}
                <FormError message={error} />
                <button
                    type="submit"
                    disabled={busy}
                    className="mt-1 inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-gradient px-6 text-sm font-semibold uppercase tracking-wider text-white shadow-glow transition-all hover:shadow-glow-lg disabled:opacity-60"
                >
                    {busy ? 'Kuting…' : mode === 'signIn' ? 'Kiriş' : 'Hisob yaratiş'}
                </button>
            </form>
        </Modal>
    );
};

export default AuthDialog;
