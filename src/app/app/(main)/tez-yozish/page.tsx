import type { Metadata } from 'next';

import TypingView from '@/components/app/typing/TypingView';

export const metadata: Metadata = {
    title: 'Tez yozish mashqi',
    description:
        'O‘zbekcha so‘zlarda tez yozishni mashq qiling: daqiqasiga so‘zlar soni (WPM), aniqlik va tezlik grafigi.',
    alternates: { canonical: '/app/tez-yozish' },
};

export default function TypingPage() {
    return <TypingView />;
}
