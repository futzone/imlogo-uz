'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuArrowRight } from 'react-icons/lu';

import { Dictation } from '@/lib/app/types';
import { Sheet } from '../Overlay';
import { AppButton } from '../ui';

const rules = [
    '✅ Diktant boşlangandan söng sahifani tark etişga ruxsat yöq. Agar çiqib ketsangiz, diktant bekor qilinadi.',
    '⏰ Diktant uçun belgilangan vaqt mavjud. Vaqt tugaşi bilan audio avtomatik töxtaydi va topşiriş imkoniyati yopiladi.',
    '🎧 Diktant faqat bir marta eşitiladi. Qayta eşitiş imkoniyati berilmaydi.',
    '🖊 Matnni tinglab darhol yozişingiz kerak. Xotiradan yozişga harakat qiling.',
    '🛑 Yoziş davomida internet uzilib qolsa, diktant natijalari saqlanmaydi.',
    '📵 Telefon yoki kompyuterning ovozini öçirib qöymang. Tinglaş uçun qurilmaning ovozi yetarli darajada baland bölişi kerak.',
    '🔒 Firibgarlik (masalan, boşqa sahifani oçiş, boşqa yordam söraş) aniqlansa, diktant avtomatik tarzda tugatiladi.',
    '📝 Diktant yakunlangaç, natijani köriş va xatolarni tahlil qiliş imkoniyati mavjud.',
];

interface Props {
    dictation: Dictation | null;
    open: boolean;
    onClose: () => void;
}

const BeforeStartSheet: React.FC<Props> = ({ dictation, open, onClose }) => {
    const router = useRouter();
    const [audioMissing, setAudioMissing] = useState(false);

    useEffect(() => setAudioMissing(false), [dictation]);

    const start = () => {
        if (!dictation) return;
        if (!dictation.url) {
            setAudioMissing(true);
            return;
        }
        router.push(`/app/diktant?id=${encodeURIComponent(dictation.id)}`);
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Diktantni boşlaş"
            subtitle="Boşlaşdan avval quyidagi qoidalar bilan tanişib çiqing 👇"
        >
            <ol className="space-y-2.5">
                {rules.map((rule, i) => (
                    <li key={rule} className="flex items-start gap-3 text-sm">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary font-mono text-[11px] font-medium text-primary">
                            {(i + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="pt-[3px]">{rule}</span>
                    </li>
                ))}
            </ol>
            {audioMissing && (
                <p role="alert" className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-center text-sm text-danger">
                    Audio tayyorlaniş jarayonida. Iltimos, hozirça boşqa diktantni sinab köring!
                </p>
            )}
            <div className="mt-5 flex justify-center">
                <AppButton onClick={start} trailingIcon={<LuArrowRight size={18} aria-hidden />}>
                    Diktantni boşlaş
                </AppButton>
            </div>
        </Sheet>
    );
};

export default BeforeStartSheet;
