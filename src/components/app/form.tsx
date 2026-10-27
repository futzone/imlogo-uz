import clsx from 'clsx';

/** Matn maydonlari uchun umumiy ko'rinish (diktant maydoni bilan bir xil). */
export const fieldClass =
    'w-full rounded-xl border border-primary/30 bg-white/85 px-4 text-base caret-primary !outline-none transition-shadow placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const TextField: React.FC<TextFieldProps> = ({ label, className, id, ...props }) => (
    <label className="block" htmlFor={id}>
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{label}</span>
        <input id={id} {...props} className={clsx(fieldClass, 'mt-1.5 h-12', className)} />
    </label>
);

/** Forma ostidagi xatolik matni. */
export const FormError: React.FC<{ message: string | null }> = ({ message }) =>
    message ? (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger-deep">
            {message}
        </p>
    ) : null;

/** Bir nechta variantdan birini tanlash uchun pill almashtirgich. */
export const Segmented = <T extends string>({
    options,
    value,
    onChange,
    className,
}: {
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}) => (
    <div className={clsx('flex rounded-full border border-line bg-white/70 p-1', className)}>
        {options.map(option => {
            const selected = option.value === value;
            return (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange(option.value)}
                    className={clsx(
                        'min-h-[40px] flex-1 whitespace-nowrap rounded-full px-3 font-mono sm:px-4 text-[11px] font-medium uppercase tracking-[0.12em] transition-all duration-200',
                        selected ? 'bg-brand-gradient text-white shadow-glow' : 'text-muted hover:text-primary'
                    )}
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);
