import AppsView from '@/components/app/AppsView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    title: 'Ilovalarimiz — Android, iOS, Windows',
    description: 'Imlo Go ilovasini Android, iOS va Windows uçun yuklab oling — diktant va tez yoziş istalgan qurilmada.',
    path: '/app/loyiha/ilovalar',
});

export default function AppsPage() {
    return <AppsView />;
}
