import type { Metadata } from 'next';
import { Suspense } from 'react';

import DictationRoute from './DictationRoute';

export const metadata: Metadata = {
    title: 'Diktant',
    robots: { index: false },
};

export default function DictationPage() {
    return (
        <Suspense>
            <DictationRoute />
        </Suspense>
    );
}
