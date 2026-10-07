import type { Metadata } from 'next';
import { Suspense } from 'react';

import ResultRoute from './ResultRoute';

export const metadata: Metadata = {
    title: 'Diktant natijasi',
    robots: { index: false },
};

export default function ResultPage() {
    return (
        <Suspense>
            <ResultRoute />
        </Suspense>
    );
}
