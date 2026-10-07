'use client';

import { FaAndroid, FaApple, FaWindows } from 'react-icons/fa';

import { ctaDetails } from '@/data/cta';
import { Sheet } from './Overlay';
import { AppButton } from './ui';

const AboutAppsSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
    <Sheet
        open={open}
        onClose={onClose}
        title="Imlo Go-ni istalgan qurilmada sinab ko‘ring"
        subtitle="Ilovalarimizni yuklab oling va istalgan qurilmada, istalgan paytda «Imlo Go» orqali o‘zbek tili imlosi bo‘yicha o‘z bilimlaringizni orttiring!"
    >
        <div className="flex flex-col gap-3 pb-2">
            <AppButton variant="outline" expand href={ctaDetails.googlePlayUrl} icon={<FaAndroid size={20} aria-hidden />}>
                Android Ilova
            </AppButton>
            <AppButton variant="outline" expand href={ctaDetails.appStoreUrl} icon={<FaApple size={20} aria-hidden />}>
                iOS uchun Ilova
            </AppButton>
            <AppButton variant="outline" expand href={ctaDetails.windowsUrl} icon={<FaWindows size={20} aria-hidden />}>
                Windows uchun Ilova
            </AppButton>
        </div>
    </Sheet>
);

export default AboutAppsSheet;
