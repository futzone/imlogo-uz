import { LuAtSign, LuHash, LuTimer, LuType } from 'react-icons/lu';
import clsx from 'clsx';

import { TypingConfig, typingOptions, withTypingMode } from '@/lib/app/typing/config';

interface Props {
    config: TypingConfig;
    onChange: (config: TypingConfig) => void;
}

/** Mashq sozlamalari: tinish belgilari, raqamlar, rejim va miqdor. */
const TypingConfigBar: React.FC<Props> = ({ config, onChange }) => (
    // Bitta qatorga sig'masa (telefon, tor oyna) ikki qatorga bo'linadi.
    <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center rounded-2xl border border-line bg-white/80 px-2 py-1.5 shadow-glow-soft">
        <div className="flex items-center">
            <Option
                icon={<LuAtSign size={15} aria-hidden />}
                selected={config.punctuation}
                onClick={() => onChange({ ...config, punctuation: !config.punctuation })}
            >
                tinish belgilari
            </Option>
            <Option
                icon={<LuHash size={15} aria-hidden />}
                selected={config.numbers}
                onClick={() => onChange({ ...config, numbers: !config.numbers })}
            >
                raqamlar
            </Option>
        </div>
        <Divider className="hidden md:block" />
        <div className="flex items-center">
            <Option
                icon={<LuTimer size={15} className="hidden md:block" aria-hidden />}
                selected={config.mode === 'time'}
                onClick={() => onChange(withTypingMode(config, 'time'))}
            >
                vaqt
            </Option>
            <Option
                icon={<LuType size={15} className="hidden md:block" aria-hidden />}
                selected={config.mode === 'words'}
                onClick={() => onChange(withTypingMode(config, 'words'))}
            >
                so‘zlar
            </Option>
            <Divider />
            {typingOptions(config).map(option => (
                <Option
                    key={option}
                    selected={config.amount === option}
                    onClick={() => onChange({ ...config, amount: option })}
                >
                    {option}
                </Option>
            ))}
        </div>
    </div>
);

const Divider: React.FC<{ className?: string }> = ({ className }) => (
    <span aria-hidden className={clsx('mx-1.5 h-5 w-px bg-primary/20', className)} />
);

interface OptionProps {
    icon?: React.ReactNode;
    selected: boolean;
    onClick: () => void;
}

const Option: React.FC<React.PropsWithChildren<OptionProps>> = ({ icon, selected, onClick, children }) => (
    <button
        type="button"
        aria-pressed={selected}
        onClick={onClick}
        className={clsx(
            'inline-flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-full px-[11px] py-2 font-mono text-[13px] leading-tight transition-colors duration-200',
            selected ? 'bg-primary/10 font-semibold text-primary' : 'text-muted hover:text-foreground'
        )}
    >
        {icon}
        {children}
    </button>
);

export default TypingConfigBar;
