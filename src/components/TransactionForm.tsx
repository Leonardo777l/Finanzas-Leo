import { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface TransactionFormProps {
    type?: 'income' | 'expense';
    category?: 'fixed' | 'variable';
    defaultCategory?: 'fixed' | 'variable';
    className?: string;
}

const FIXED_EXPENSES = [
    'RENTA',
    'PAÑALES',
    'DIVIDENDO LEO (15%)',
    'DIVIDENDO FER (15%)',
    'TELEFONO',
    'COMIDA',
    'CONTADORA',
    'LUZ',
    'RENTA OFICINA',
    'INTERNET'
];

export function TransactionForm({ type = 'expense', category, defaultCategory, className }: TransactionFormProps) {
    const addTransaction = useFinanceStore((state) => state.addTransaction);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'fixed' | 'variable'>(defaultCategory || 'variable');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        addTransaction({
            date: new Date().toISOString(),
            description,
            amount: Number(amount),
            type,
            category: category || selectedCategory,
        });

        setDescription('');
        setAmount('');
    };

    return (
        <form onSubmit={handleSubmit} className={cn("flex gap-2 items-end", className)}>
            <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Descripción</label>
                {category === 'fixed' ? (
                    <select
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                        <option value="">Seleccionar gasto...</option>
                        {FIXED_EXPENSES.map((expense) => (
                            <option key={expense} value={expense}>
                                {expense}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ej: Supermercado"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                )}
            </div>

            <div className="w-32 space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Monto</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
            </div>

            {!category && (
                <div className="w-32 space-y-1">
                    <label className="text-xs text-muted-foreground ml-1">Tipo</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as 'fixed' | 'variable')}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                        <option value="variable">Variable</option>
                        <option value="fixed">Fijo</option>
                    </select>
                </div>
            )}

            <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white p-2 rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
                <Plus size={20} />
            </button>
        </form>
    );
}
