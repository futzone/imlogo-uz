'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuArrowRight } from 'react-icons/lu';

import { Dictation } from '@/lib/app/types';
import { Sheet } from '../Overlay';
import { AppButton } from '../ui';

const rules = [
    '✅ Diktant boshlangandan so‘ng sahifani tark etishga ruxsat yo‘q. Agar chiqib ketsangiz, diktant bekor qilinadi.',
    '⏰ Diktant uchun belgilangan vaqt mavjud. Vaqt tugashi bilan audio avtomatik to‘xtaydi va topshirish imkoniyati yopiladi.',
    '🎧 Diktant faqat bir marta eshitiladi. Qayta eshitish imkoniyati berilmaydi.',
    '🖊 Matnni tinglab darhol yozishingiz kerak. Xotiradan yozishga harakat qiling.',
    '🛑 Yozish davomida internet uzilib qolsa, diktant natijalari saqlanmaydi.',
    '📵 Telefon yoki kompyuterning ovozini o‘chirib qo‘ymang. Tinglash uchun qurilmaning ovozi yetarli darajada baland bo‘lishi kerak.',
    '🔒 Firibgarlik (masalan, boshqa sahifani ochish, boshqa yordam so‘rash) aniqlansa, diktant avtomatik tarzda tugatiladi.',
    '📝 Diktant yakunlangach, natijani ko‘rish va xatolarni tahlil qilish imkoniyati mavjud.',
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
            title="Diktantni boshlash"
            subtitle="Boshlashdan avval quyidagi qoidalar bilan tanishib chiqing 👇"
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
                    Audio tayyorlanish jarayonida. Iltimos, hozircha boshqa diktantni sinab ko‘ring!
                </p>
            )}
            <div className="mt-5 flex justify-center">
                <AppButton onClick={start} trailingIcon={<LuArrowRight size={18} aria-hidden />}>
                    Diktantni boshlash
                </AppButton>
            </div>
        </Sheet>
    );
};

export default BeforeStartSheet;
