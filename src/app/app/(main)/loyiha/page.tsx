import AboutView from '@/components/app/AboutView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    title: 'Loyiha haqida',
    description: 'Imlo Go — özbek tili imlosi, diktant, tez yoziş va transliteratsiya uçun oçiq va bepul platforma.',
    path: '/app/loyiha',
});

export default function AboutPage() {
    return <AboutView />;
}
