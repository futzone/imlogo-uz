import { LuAtSign, LuHash, LuLanguages, LuQuote, LuTimer, LuType } from 'react-icons/lu';
import clsx from 'clsx';

import { hasTypingExtras, TypingConfig, typingAlphabets, typingOptions, withTypingMode } from '@/lib/app/typing/config';

interface Props {
    config: TypingConfig;
    onChange: (config: TypingConfig) => void;
}

/**
 * Mashq sozlamalari uchta alohida guruhda: yozuv, qo'shimchalar (tinish
 * belgilari, raqamlar) va rejim bilan miqdor. Joy yetmasa, guruhlar butunligicha
 * keyingi qatorga o'tadi — hech biri kesilmaydi. Gaplar rejimida qo'shimchalar
 * o'chiriladi: gaplarda tinish belgilari va raqamlar o'zi bor.
 */
const TypingConfigBar: React.FC<Props> = ({ config, onChange }) => {
    const extras = hasTypingExtras(config);
    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <Group label="Yozuv">
                <LuLanguages size={15} className="ml-1.5 mr-0.5 hidden text-muted sm:block" aria-hidden />
                {typingAlphabets.map(option => (
                    <Option
                        key={option.value}
                        selected={config.alphabet === option.value}
                        onClick={() => onChange({ ...config, alphabet: option.value })}
                    >
                        {option.label}
                    </Option>
                ))}
            </Group>

            <Group label="Qöşimçalar">
                <Option
                    icon={<LuAtSign size={15} aria-hidden />}
                    selected={extras && config.punctuation}
                    disabled={!extras}
                    onClick={() => onChange({ ...config, punctuation: !config.punctuation })}
                    title={extras ? 'Tiniş belgilari' : 'Gaplarda tiniş belgilari özi bor'}
                >
                    <span className="hidden xl:inline">tiniş belgilari</span>
                    <span className="xl:hidden">tiniş</span>
                </Option>
                <Option
                    icon={<LuHash size={15} aria-hidden />}
                    selected={extras && config.numbers}
                    disabled={!extras}
                    onClick={() => onChange({ ...config, numbers: !config.numbers })}
                    title={extras ? 'Raqamlar' : 'Gaplarda raqamlar özi bor'}
                >
                    raqamlar
                </Option>
            </Group>

            <Group label="Rejim">
                <Option
                    icon={<LuTimer size={15} className="hidden sm:block" aria-hidden />}
                    selected={config.mode === 'time'}
                    onClick={() => onChange(withTypingMode(config, 'time'))}
                >
                    vaqt
                </Option>
                <Option
                    icon={<LuType size={15} className="hidden sm:block" aria-hidden />}
                    selected={config.mode === 'words'}
                    onClick={() => onChange(withTypingMode(config, 'words'))}
                >
                    sözlar
                </Option>
                <Option
                    icon={<LuQuote size={15} className="hidden sm:block" aria-hidden />}
                    selected={config.mode === 'sentences'}
                    onClick={() => onChange(withTypingMode(config, 'sentences'))}
                >
                    gaplar
                </Option>
                <span aria-hidden className="mx-1 h-5 w-px bg-primary/20" />
                {typingOptions(config).map(option => (
                    <Option
                        key={option}
                        selected={config.amount === option}
                        onClick={() => onChange({ ...config, amount: option })}
                    >
                        {option}
                    </Option>
                ))}
            </Group>
        </div>
    );
};

const Group: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
    <div
        role="group"
        aria-label={label}
        className="flex items-center rounded-full border border-line bg-white/80 px-1 py-1 shadow-glow-soft"
    >
        {children}
    </div>
);

interface OptionProps {
    icon?: React.ReactNode;
    selected: boolean;
    disabled?: boolean;
    onClick: () => void;
    title?: string;
}

const Option: React.FC<React.PropsWithChildren<OptionProps>> = ({ icon, selected, disabled, onClick, title, children }) => (
    <button
        type="button"
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
        title={title}
        className={clsx(
            'inline-flex min-h-[36px] min-w-[36px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 font-mono text-[13px] leading-tight transition-colors duration-200',
            selected ? 'bg-primary/10 font-semibold text-primary' : 'text-muted enabled:hover:text-foreground',
            disabled && 'cursor-not-allowed opacity-40'
        )}
    >
        {icon}
        {children}
    </button>
);

export default TypingConfigBar;
