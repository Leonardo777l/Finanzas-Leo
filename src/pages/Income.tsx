import { useState } from 'react';
import { TransactionList } from '../components/TransactionList';
import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from '../components/ui/GlassCard';
import { SmartIncomeModal } from '../components/SmartIncomeModal';
import { Plus } from 'lucide-react';

export function Income() {
    const transactions = useFinanceStore((state) => state.transactions);
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

    const income = transactions.filter((t) => t.type === 'income');
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Gestión de Ingresos
                </h2>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-semibold text-emerald-400">Distribución de Ingresos</h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsIncomeModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors"
                            >
                                <Plus size={18} />
                                Registrar Ingreso
                            </button>
                            <span className="font-bold text-lg">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalIncome)}
                            </span>
                        </div>
                    </div>
                    <GlassCard className="min-h-[500px]" delay={0.1}>
                        <TransactionList transactions={income} />
                    </GlassCard>
                </div>
            </div>

            <SmartIncomeModal
                isOpen={isIncomeModalOpen}
                onClose={() => setIsIncomeModalOpen(false)}
            />
        </div>
    );
}
