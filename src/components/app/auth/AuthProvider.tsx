'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ClientResponseError } from 'pocketbase';

import { Account, pb, pingOnline, toAccount } from '@/lib/app/account';
import AuthDialog from './AuthDialog';
import FeedbackDialog from './FeedbackDialog';

interface AuthContextValue {
    /** Kirgan foydalanuvchi; mehmon bo'lsa — `null`. */
    account: Account | null;
    /** Sessiya brauzer xotirasidan o'qib bo'lingan (birinchi chizishda hali `false`). */
    ready: boolean;
    openSignIn: () => void;
    openFeedback: () => void;
    signOut: () => void;
}

/** Faollik vaqti shu oraliqda yangilanadi (serverda ham daqiqasiga bir martadan ko'p yozilmaydi). */
const PING_INTERVAL_MS = 5 * 60 * 1000;

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
    const value = useContext(AuthContext);
    if (!value) throw new Error('useAuth faqat AuthProvider içida işlatiladi');
    return value;
};

/** Ilova bo'ylab hisob holati hamda kirish va murojaat oynalari. */
const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [account, setAccount] = useState<Account | null>(null);
    const [ready, setReady] = useState(false);
    const [dialog, setDialog] = useState<'signIn' | 'feedback' | null>(null);

    useEffect(() => {
        const store = pb().authStore;
        const unsubscribe = store.onChange(() => {
            setAccount(store.isValid && store.record ? toAccount(store.record) : null);
        }, true);
        setReady(true);

        // Saqlangan sessiya serverda hamon amal qilishini tekshiramiz (foydalanuvchi o'chirilgan bo'lishi mumkin).
        if (store.isValid) {
            pb()
                .collection('users')
                .authRefresh()
                .catch(error => {
                    if (error instanceof ClientResponseError && (error.status === 401 || error.status === 404)) {
                        store.clear();
                    }
                });
        }
        return unsubscribe;
    }, []);

    // Oxirgi faollik vaqti (profilda "oxirgi marta onlayn"): sahifa ochiq va ko'rinib turganda.
    const userId = account?.id;
    useEffect(() => {
        if (!userId) return;
        const ping = () => document.visibilityState === 'visible' && pingOnline().catch(() => undefined);
        const timer = setInterval(ping, PING_INTERVAL_MS);
        document.addEventListener('visibilitychange', ping);
        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', ping);
        };
    }, [userId]);

    const signOut = useCallback(() => pb().authStore.clear(), []);
    const openSignIn = useCallback(() => setDialog('signIn'), []);
    const openFeedback = useCallback(() => setDialog('feedback'), []);

    const value = useMemo(
        () => ({ account, ready, openSignIn, openFeedback, signOut }),
        [account, ready, openSignIn, openFeedback, signOut]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
            <AuthDialog open={dialog === 'signIn'} onClose={() => setDialog(null)} />
            <FeedbackDialog
                open={dialog === 'feedback'}
                onClose={() => setDialog(null)}
                onSignIn={() => setDialog('signIn')}
            />
        </AuthContext.Provider>
    );
};

export default AuthProvider;
