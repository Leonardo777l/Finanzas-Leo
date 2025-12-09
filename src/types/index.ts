export type TransactionType = 'income' | 'expense';
export type ExpenseCategory = 'fixed' | 'variable';

export interface Transaction {
    id: string;
    date: string; // ISO date string
    description: string;
    amount: number;
    type: TransactionType;
    category?: ExpenseCategory; // Only for expenses
    tag?: string; // e.g., "Rent", "Groceries"
}

export interface Asset {
    id: string;
    symbol: string;
    name: string;
    type: 'crypto' | 'stock';
    quantity: number;
    avgBuyPrice: number;
    currentPrice: number; // Manually updated or mocked
}

export interface Budget {
    month: string; // YYYY-MM
    income: number;
    fixedExpenses: number;
    variableExpenses: number;
    savings: number;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    icon?: string;
    color?: string;
}

export interface Subscription {
    id: string;
    name: string;
    amount: number;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: string;
    category?: string;
    icon?: string;
}

export interface AppState {
    transactions: Transaction[];
    assets: Asset[];
    goals: Goal[];
    subscriptions: Subscription[];
    currency: string;
    userId: string | null;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    addTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
    removeTransaction: (id: string) => void;
    addAsset: (asset: Omit<Asset, 'id'>) => void;
    removeAsset: (id: string) => void;
    updateAsset: (id: string, updates: Partial<Asset>) => void;
    addGoal: (goal: Omit<Goal, 'id'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    removeGoal: (id: string) => void;
    addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
    removeSubscription: (id: string) => void;
    resetData: () => void;
    exportData: () => string;
    importData: (json: string) => void;
    setUserId: (uid: string | null) => void;
}
