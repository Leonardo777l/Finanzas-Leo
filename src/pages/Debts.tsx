import { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { AddDebtModal } from '../components/AddDebtModal';
import { DebtCard } from '../components/DebtCard';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Debts() {
    const { debts, currency } = useFinanceStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const totalDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const monthlyCommitment = debts.reduce((sum, d) => {
        // Only count if not fully paid
        return d.remainingAmount > 0 ? sum + d.monthlyAmount : sum;
    }, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Gestión de Deudas
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Control de pagos diferidos y compromisos mensuales
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                    >
                        <Plus size={18} />
                        Nueva Deuda
                    </button>
                </div>
            </div>

            {/* Summary KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
                    <p className="text-sm text-red-300 font-medium mb-1">Deuda Total Restante</p>
                    <p className="text-3xl font-bold text-red-500">{formatCurrency(totalDebt, currency)}</p>
                </div>
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Compromiso Mensual Actual</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(monthlyCommitment, currency)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {debts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
                        No tienes deudas registradas. ¡Excelente trabajo financiero!
                    </div>
                ) : (
                    debts.map((debt) => (
                        <DebtCard key={debt.id} debt={debt} />
                    ))
                )}
            </div>

            <AddDebtModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
