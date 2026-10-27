import { FaAndroid, FaApple, FaWindows } from 'react-icons/fa';

import { ctaDetails } from '@/data/cta';
import DashboardPage from './DashboardPage';
import { AppButton, cardClass } from './ui';

const apps = [
    { label: 'Android ilova', hint: 'Google Play', href: ctaDetails.googlePlayUrl, icon: <FaAndroid size={28} aria-hidden /> },
    { label: 'iOS uçun ilova', hint: 'iPhone, iPad', href: ctaDetails.appStoreUrl, icon: <FaApple size={28} aria-hidden /> },
    { label: 'Windows uçun ilova', hint: 'Kompyuter', href: ctaDetails.windowsUrl, icon: <FaWindows size={28} aria-hidden /> },
];

/** "Ilovalarimiz": Android, iOS va Windows ilovalariga havolalar. */
const AppsView: React.FC = () => (
    <DashboardPage
        title="Ilovalarimiz"
        subtitle="Ilovalarimizni yuklab oling va istalgan qurilmada, istalgan paytda «Imlo Go» orqali özbek tili imlosi böyiça bilimlaringizni orttiring!"
    >
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {apps.map(app => (
                <div key={app.label} className={`${cardClass} flex flex-col items-start gap-4 p-6`}>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                        {app.icon}
                    </span>
                    <div>
                        <p className="font-heading text-lg font-semibold">{app.label}</p>
                        <p className="text-sm text-muted">{app.hint}</p>
                    </div>
                    <AppButton variant="outline" expand href={app.href} className="mt-auto">
                        Yuklab oliş
                    </AppButton>
                </div>
            ))}
        </div>
    </DashboardPage>
);

export default AppsView;
