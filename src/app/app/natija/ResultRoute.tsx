'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import DictationResult from '@/components/app/dictation/DictationResult';

export default function ResultRoute() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');

    useEffect(() => {
        if (!id) router.replace('/app');
    }, [id, router]);

    return id ? <DictationResult id={id} fromHistory={params.has('tarix')} /> : null;
}
