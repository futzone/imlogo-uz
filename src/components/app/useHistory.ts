'use client';

import { useEffect, useState } from 'react';

import { History, loadHistory, subscribeHistory } from '@/lib/app/history';
import { useAuth } from './auth/AuthProvider';

/** Joriy foydalanuvchi natijalari (`null` — hali yuklanmoqda). */
export const useHistory = (): History | null => {
    const { account, ready } = useAuth();
    const [history, setHistory] = useState<History | null>(null);
    const [version, setVersion] = useState(0);
    const userId = account?.id ?? null;

    useEffect(() => subscribeHistory(() => setVersion(v => v + 1)), []);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        loadHistory(userId).then(result => !cancelled && setHistory(result));
        return () => {
            cancelled = true;
        };
    }, [userId, ready, version]);

    return history;
};
