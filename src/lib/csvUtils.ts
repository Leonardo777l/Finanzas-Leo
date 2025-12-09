import type { Transaction } from '../types';

export const CSV_HEADERS = ['Fecha (YYYY-MM-DD)', 'Descripción', 'Monto', 'Categoría (income/expense/fixed)', 'Etiqueta (Opcional)'];

export const generateCSVTemplate = () => {
    const headers = CSV_HEADERS.join(',');
    const example = '2024-01-15,Supermercado,1500.50,expense,Comida';
    return `${headers}\n${example}`;
};

export const parseCSV = (content: string): Partial<Transaction>[] => {
    const lines = content.split('\n');
    const transactions: Partial<Transaction>[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [date, description, amountStr, type, category] = line.split(',');

        if (date && description && amountStr && type) {
            transactions.push({
                date: date, // Keep as string, store handles it or components handle it
                description,
                amount: parseFloat(amountStr),
                type: type as 'income' | 'expense',
                category: (category || 'General') as any // Cast to any to avoid strict literal check for now, or import ExpenseCategory
            });
        }
    }

    return transactions;
};
