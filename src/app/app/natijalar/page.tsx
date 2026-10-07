import type { Metadata } from 'next';
import { Suspense } from 'react';

import ResultsRoute from './ResultsRoute';

export const metadata: Metadata = {
    title: 'Mening natijalarim',
    robots: { index: false },
};

export default function ResultsPage() {
    return (
        <Suspense>
            <ResultsRoute />
        </Suspense>
    );
}
