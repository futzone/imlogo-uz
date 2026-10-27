'use client';

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import clsx from 'clsx';

import { AppButton } from './ui';

const backdropClass =
    'fixed inset-0 bg-primary-accent/25 transition-opacity duration-200 ease-out data-[closed]:opacity-0';

interface SheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
}

/** Pastdan chiqadigan oyna (bottom sheet) uchun umumiy qolip. */
export const Sheet: React.FC<React.PropsWithChildren<SheetProps>> = ({ open, onClose, title, subtitle, children }) => (
    <Dialog open={open} onClose={onClose} className="relative z-50 text-base">
        <DialogBackdrop transition className={backdropClass} />
        <div className="fixed inset-0 flex items-end justify-center">
            <DialogPanel
                transition
                className="max-h-[90dvh] w-full max-w-[600px] overflow-y-auto rounded-t-3xl bg-white px-5 pb-4 pt-3 shadow-glow-card transition duration-300 ease-out data-[closed]:translate-y-full"
            >
                <div aria-hidden className="mx-auto h-1 w-10 rounded-full bg-primary/25" />
                <DialogTitle className="mt-5 text-center font-heading text-xl font-bold sm:text-[26px]">
                    {title}
                </DialogTitle>
                {subtitle && <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>}
                <div className="mt-5">{children}</div>
                <div className="mt-2 flex justify-center">
                    <AppButton variant="ghost" onClick={onClose}>
                        Yopiş
                    </AppButton>
                </div>
            </DialogPanel>
        </div>
    </Dialog>
);

interface ModalProps {
    open: boolean;
    onClose: () => void;
    className?: string;
}

/** Ekran markazidagi oyna. */
export const Modal: React.FC<React.PropsWithChildren<ModalProps>> = ({ open, onClose, className, children }) => (
    <Dialog open={open} onClose={onClose} className="relative z-50 text-base">
        <DialogBackdrop transition className={backdropClass} />
        <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel
                transition
                className={clsx(
                    'max-h-full w-full overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-glow-card transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0',
                    className
                )}
            >
                {children}
            </DialogPanel>
        </div>
    </Dialog>
);

export { DialogTitle as ModalTitle };
