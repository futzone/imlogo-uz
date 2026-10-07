'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import DictationSession from '@/components/app/dictation/DictationSession';

/** Diktant identifikatori manzildagi `?id=` parametridan olinadi. */
export default function DictationRoute() {
    const router = useRouter();
    const id = useSearchParams().get('id');

    useEffect(() => {
        if (!id) router.replace('/app');
    }, [id, router]);

    return id ? <DictationSession key={id} id={id} /> : null;
}
