import { Trash } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionListProps {
    transactions: import('../types').Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    const removeTransaction = useFinanceStore((state) => state.removeTransaction);

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground text-sm">
                No hay transacciones registradas
            </div>
        );
    }

    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="space-y-2">
            {sortedTransactions.map((transaction) => (
                <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                >
                    <div className="flex flex-col">
                        <span className="font-medium">{transaction.description}</span>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "d 'de' MMMM", { locale: es })}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`font-bold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN'
                            }).format(transaction.amount)}
                        </span>
                        <button
                            onClick={() => removeTransaction(transaction.id)}
                            className="text-muted-foreground hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
