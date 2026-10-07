'use client';

import { useSearchParams } from 'next/navigation';

import ResultsView from '@/components/app/ResultsView';

export default function ResultsRoute() {
    // `?tab=1` — tez yozish natijalari, aks holda diktantlar.
    return <ResultsView initialTab={useSearchParams().get('tab') === '1' ? 1 : 0} />;
}
