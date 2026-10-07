import { useSyncExternalStore } from 'react';

import { fetchDictations } from './pocketbase';
import { Dictation } from './types';

export interface DictationListState {
    items: Dictation[];
    currentPage: number;
    totalPages: number;
    isLoadingMore: boolean;
    isInitialLoading: boolean;
    error: string | null;
}

const initialState: DictationListState = {
    items: [],
    currentPage: 0,
    totalPages: 1,
    isLoadingMore: false,
    isInitialLoading: true,
    error: null,
};

// Ro'yxat modul darajasida saqlanadi — bo'limlar orasida almashganda qayta yuklanmaydi.
let state = initialState;
const listeners = new Set<() => void>();

const setState = (patch: Partial<DictationListState>) => {
    state = { ...state, ...patch };
    listeners.forEach(listener => listener());
};

export const hasMoreDictations = (s: DictationListState) => s.currentPage < s.totalPages;

export const fetchNextDictations = async () => {
    if (state.isLoadingMore || (!state.isInitialLoading && !hasMoreDictations(state))) return;

    setState({ isLoadingMore: true, error: null });
    try {
        const nextPage = state.currentPage + 1;
        const result = await fetchDictations(nextPage);
        setState({
            items: [...state.items, ...result.items],
            currentPage: nextPage,
            totalPages: result.totalPages,
            isLoadingMore: false,
            isInitialLoading: false,
        });
    } catch (error) {
        setState({
            isLoadingMore: false,
            isInitialLoading: false,
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const refreshDictations = async () => {
    if (state.isLoadingMore) return;
    setState(initialState);
    await fetchNextDictations();
};

export const findLoadedDictation = (id: string): Dictation | undefined =>
    state.items.find(item => item.id === id);

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const useDictations = (): DictationListState =>
    useSyncExternalStore(subscribe, () => state, () => initialState);
