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
            syncStatus: 'offline',
            syncError: null,

            setUserId: (uid) => {
                set({ userId: uid });
            },

            setSyncStatus: (status, error = null) => set({ syncStatus: status, syncError: error }),

            bitsoApiKeys: {
                key: 'UgEGKpZKGU',
                secret: 'c0582b6057d80aee02d47d7a04b352ad'
            },
            isBitsoSyncing: false,

            setBitsoKeys: (keys) => set({ bitsoApiKeys: keys }),
            setBitsoSyncing: (isSyncing) => set({ isBitsoSyncing: isSyncing }),

            // Initialize with the provided Token and Query ID
            ibkrCredentials: { token: '41083274288911012200493', queryId: '1380920' },
            isIbkrSyncing: false,
            setIbkrCredentials: (creds) => set({ ibkrCredentials: creds }),
            setIbkrSyncing: (isSyncing) => set({ isIbkrSyncing: isSyncing }),

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

            debts: [],

            addDebt: (debt) =>
                set((state) => ({
                    debts: [...(state.debts || []), { ...debt, id: crypto.randomUUID() }],
                })),

            removeDebt: (id) =>
                set((state) => ({
                    debts: (state.debts || []).filter((d) => d.id !== id),
                })),

            payInstallment: (debtId, paymentDate) =>
                set((state) => {
                    const debts = state.debts || [];
                    const debtToUpdate = debts.find((d) => d.id === debtId);

                    if (!debtToUpdate) return {};

                    // Prevent double payment for the same month - CHECK BOTH PAYMENTS AND TRANSACTIONS IF NEEDED
                    // The 'payments' array is the source of truth for the debt progress
                    if (debtToUpdate.payments.includes(paymentDate)) {
                        return {};
                    }

                    // We also need to check if a transaction for this specific installment already exists to be safe
                    // But relying on the 'payments' array check above should be sufficient if state is consistent.

                    const updatedDebt = {
                        ...debtToUpdate,
                        installmentsPaid: debtToUpdate.installmentsPaid + 1,
                        remainingAmount: debtToUpdate.remainingAmount - debtToUpdate.monthlyAmount,
                        payments: [...debtToUpdate.payments, paymentDate],
                    };

                    // Automatically add expense transaction
                    const newTransaction: any = {
                        id: crypto.randomUUID(),
                        date: new Date().toISOString(), // Or use paymentDate if we want to force the specific month
                        description: `Pago ${updatedDebt.name} (${updatedDebt.installmentsPaid}/${updatedDebt.totalInstallments})`,
                        amount: updatedDebt.monthlyAmount,
                        type: 'expense',
                        category: 'fixed', // Debts are usually fixed commitments
                        tag: 'deudas'
                    };

                    return {
                        debts: debts.map((d) => (d.id === debtId ? updatedDebt : d)),
                        transactions: [...state.transactions, newTransaction]
                    };
                }),

            resetData: () => set({ transactions: [], assets: [], goals: [], subscriptions: [], debts: [] }),

            importData: (json) => {
                try {
                    const data = JSON.parse(json);
                    if (data.transactions && data.assets) {
                        set({
                            transactions: data.transactions,
                            assets: data.assets,
                            goals: data.goals || [],
                            subscriptions: data.subscriptions || [],
                            debts: data.debts || []
                        });
                    }
                } catch (e) {
                    console.error('Failed to import data', e);
                }
            },

            exportData: () => {
                const { transactions, assets, goals, subscriptions, debts } = get();
                return JSON.stringify({ transactions, assets, goals, subscriptions, debts });
            },
        }),
        {
            name: 'finance-storage',
            partialize: (state) => ({
                transactions: state.transactions,
                assets: state.assets,
                goals: state.goals,
                subscriptions: state.subscriptions,
                debts: state.debts, // Persist debts
                currency: state.currency,
                bitsoApiKeys: state.bitsoApiKeys,
                ibkrCredentials: state.ibkrCredentials,
                // Don't persist userId to avoid issues with stale auth states
                // Don't persist sync status or bitso syncing state
            } as AppState),
        }
    )
);
