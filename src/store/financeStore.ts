import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '../types';

export const useFinanceStore = create<AppState>()(
    persist(
        (set, get) => ({
            transactions: [],
            assets: [],
            goals: [],
            subscriptions: [],
            currency: 'MXN',
            userId: null,

            setUserId: (uid) => {
                set({ userId: uid });
            },

            addTransaction: (transaction) =>
                set((state) => ({
                    transactions: [...state.transactions, { ...transaction, id: crypto.randomUUID() }],
                })),

            addTransactions: (newTransactions) =>
                set((state) => ({
                    transactions: [
                        ...state.transactions,
                        ...newTransactions.map(t => ({ ...t, id: crypto.randomUUID() }))
                    ],
                })),

            removeTransaction: (id) =>
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                })),

            addAsset: (asset) =>
                set((state) => ({
                    assets: [...state.assets, { ...asset, id: crypto.randomUUID() }],
                })),

            updateAsset: (id, updates) =>
                set((state) => ({
                    assets: state.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)),
                })),

            removeAsset: (id) =>
                set((state) => ({
                    assets: state.assets.filter((a) => a.id !== id),
                })),

            addGoal: (goal) =>
                set((state) => ({
                    goals: [...state.goals, { ...goal, id: crypto.randomUUID() }],
                })),

            updateGoal: (id, updates) =>
                set((state) => ({
                    goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
                })),

            removeGoal: (id) =>
                set((state) => ({
                    goals: state.goals.filter((g) => g.id !== id),
                })),

            addSubscription: (subscription) =>
                set((state) => ({
                    subscriptions: [...state.subscriptions, { ...subscription, id: crypto.randomUUID() }],
                })),

            removeSubscription: (id) =>
                set((state) => ({
                    subscriptions: state.subscriptions.filter((s) => s.id !== id),
                })),

            resetData: () => set({ transactions: [], assets: [], goals: [], subscriptions: [] }),

            importData: (json) => {
                try {
                    const data = JSON.parse(json);
                    if (data.transactions && data.assets) {
                        set({
                            transactions: data.transactions,
                            assets: data.assets,
                            goals: data.goals || [],
                            subscriptions: data.subscriptions || []
                        });
                    }
                } catch (e) {
                    console.error('Failed to import data', e);
                }
            },

            exportData: () => {
                const { transactions, assets, goals, subscriptions } = get();
                return JSON.stringify({ transactions, assets, goals, subscriptions });
            },
        }),
        {
            name: 'finance-storage',
            partialize: (state) => ({
                transactions: state.transactions,
                assets: state.assets,
                goals: state.goals,
                subscriptions: state.subscriptions,
                currency: state.currency,
                // Don't persist userId to avoid issues with stale auth states
            } as AppState),
        }
    )
);
