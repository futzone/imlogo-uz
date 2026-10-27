'use client';

import { useEffect, useState } from 'react';
import { LuCheckCircle2, LuX } from 'react-icons/lu';

import { accountErrorMessage, FeedbackKind, sendFeedback } from '@/lib/app/account';
import { fieldClass, FormError, Segmented } from '../form';
import { Modal, ModalTitle } from '../Overlay';
import { AppButton } from '../ui';
import { useAuth } from './AuthProvider';

const kinds: { value: FeedbackKind; label: string }[] = [
    { value: 'xatolik', label: 'Xatolik' },
    { value: 'taklif', label: 'Taklif' },
    { value: 'savol', label: 'Savol' },
    { value: 'boshqa', label: 'Boşqa' },
];

const MAX_LENGTH = 2000;

/** Saytdagi xatolik, taklif yoki savol haqida murojaat (faqat kirgan foydalanuvchilar uchun). */
const FeedbackDialog: React.FC<{ open: boolean; onClose: () => void; onSignIn: () => void }> = ({
    open,
    onClose,
    onSignIn,
}) => {
    const { account } = useAuth();
    const [kind, setKind] = useState<FeedbackKind>('xatolik');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (open) {
            setSent(false);
            setError(null);
        }
    }, [open]);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!account || !message.trim()) return;
        setBusy(true);
        setError(null);
        try {
            await sendFeedback(account.id, kind, message, window.location.pathname + window.location.search);
            setMessage('');
            setSent(true);
        } catch (e) {
            setError(accountErrorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} className="relative max-w-[520px]">
            <button
                type="button"
                onClick={onClose}
                aria-label="Yopiş"
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-primary/10 hover:text-primary"
            >
                <LuX size={20} aria-hidden />
            </button>
            <ModalTitle className="pr-8 font-heading text-2xl font-bold">Murojaat qoldiriş</ModalTitle>

            {!account ? (
                <>
                    <p className="mt-2 text-sm text-muted">
                        Murojaat qoldiriş uçun hisobingizga kiring — javobni şu email manzilingizga yuboramiz.
                    </p>
                    <AppButton className="mt-5" expand onClick={onSignIn}>
                        Kiriş
                    </AppButton>
                </>
            ) : sent ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <LuCheckCircle2 size={40} className="text-success" aria-hidden />
                    <p className="font-heading text-lg font-semibold">Rahmat! Murojaatingiz qabul qilindi</p>
                    <p className="text-sm text-muted">Kerak bölsa, {account.email} manziliga javob yozamiz.</p>
                    <AppButton variant="ghost" onClick={onClose}>
                        Yopiş
                    </AppButton>
                </div>
            ) : (
                <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
                    <p className="text-sm text-muted">Saytdagi xatolik, taklif yoki savolingizni yozing.</p>
                    <Segmented className="flex w-full" options={kinds} value={kind} onChange={setKind} />
                    <div>
                        <textarea
                            value={message}
                            onChange={event => setMessage(event.target.value.slice(0, MAX_LENGTH))}
                            rows={6}
                            required
                            placeholder={
                                kind === 'xatolik'
                                    ? 'Qaysi sahifada, nima qilganda xatolik çiqdi?'
                                    : 'Murojaatingizni yozing'
                            }
                            className={`${fieldClass} min-h-[9rem] resize-y py-3 leading-relaxed`}
                        />
                        <p className="mt-1 text-right font-mono text-[11px] text-muted">
                            {message.length}/{MAX_LENGTH}
                        </p>
                    </div>
                    <FormError message={error} />
                    <button
                        type="submit"
                        disabled={busy || !message.trim()}
                        className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-gradient px-6 text-sm font-semibold uppercase tracking-wider text-white shadow-glow transition-all hover:shadow-glow-lg disabled:opacity-60"
                    >
                        {busy ? 'Yuborilmoqda…' : 'Yuboriş'}
                    </button>
                </form>
            )}
        </Modal>
    );
};

export default FeedbackDialog;
