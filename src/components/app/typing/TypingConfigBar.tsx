import { LuAtSign, LuHash, LuLanguages, LuTimer, LuType } from 'react-icons/lu';
import clsx from 'clsx';

import { TypingConfig, typingAlphabets, typingOptions, withTypingMode } from '@/lib/app/typing/config';

interface Props {
    config: TypingConfig;
    onChange: (config: TypingConfig) => void;
}

/**
 * Mashq sozlamalari uchta alohida guruhda: yozuv, qo'shimchalar (tinish
 * belgilari, raqamlar) va rejim bilan miqdor. Joy yetmasa, guruhlar butunligicha
 * keyingi qatorga o'tadi — hech biri kesilmaydi.
 */
const TypingConfigBar: React.FC<Props> = ({ config, onChange }) => (
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
                selected={config.punctuation}
                onClick={() => onChange({ ...config, punctuation: !config.punctuation })}
                title="Tiniş belgilari"
            >
                <span className="hidden xl:inline">tiniş belgilari</span>
                <span className="xl:hidden">tiniş</span>
            </Option>
            <Option
                icon={<LuHash size={15} aria-hidden />}
                selected={config.numbers}
                onClick={() => onChange({ ...config, numbers: !config.numbers })}
                title="Raqamlar"
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
    onClick: () => void;
    title?: string;
}

const Option: React.FC<React.PropsWithChildren<OptionProps>> = ({ icon, selected, onClick, title, children }) => (
    <button
        type="button"
        aria-pressed={selected}
        onClick={onClick}
        title={title}
        className={clsx(
            'inline-flex min-h-[36px] min-w-[36px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 font-mono text-[13px] leading-tight transition-colors duration-200',
            selected ? 'bg-primary/10 font-semibold text-primary' : 'text-muted hover:text-foreground'
        )}
    >
        {icon}
        {children}
    </button>
);

export default TypingConfigBar;
