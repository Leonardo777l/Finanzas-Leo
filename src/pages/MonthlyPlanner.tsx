import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from '../components/ui/GlassCard';

export function MonthlyPlanner() {
    const transactions = useFinanceStore((state) => state.transactions);

    const income = transactions.filter((t) => t.type === 'income');
    const fixedExpenses = transactions.filter((t) => t.type === 'expense' && t.category === 'fixed');
    const variableExpenses = transactions.filter((t) => t.type === 'expense' && t.category === 'variable');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalFixed = fixedExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalVariable = variableExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = totalFixed + totalVariable;
    const savings = totalIncome - totalExpenses;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Planeador Mensual
                </h2>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Ahorro Estimado</p>
                    <p className={`text-2xl font-bold ${savings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(savings)}
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Income Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-semibold text-emerald-400">Ingresos</h3>
                        <span className="font-bold text-lg">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalIncome)}
                        </span>
                    </div>
                    <GlassCard className="min-h-[300px]" delay={0.1}>
                        <TransactionForm type="income" className="mb-6" />
                        <TransactionList transactions={income} />
                    </GlassCard>
                </div>

                {/* Expenses Column */}
                <div className="space-y-8">
                    {/* Fixed Expenses */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-semibold text-blue-400">Gastos Fijos</h3>
                            <span className="font-bold text-lg">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalFixed)}
                            </span>
                        </div>
                        <GlassCard className="min-h-[300px]" delay={0.2}>
                            <TransactionForm type="expense" category="fixed" defaultCategory="fixed" className="mb-6" />
                            <TransactionList transactions={fixedExpenses} />
                        </GlassCard>
                    </div>

                    {/* Variable Expenses */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-semibold text-orange-400">Gastos Variables</h3>
                            <span className="font-bold text-lg">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalVariable)}
                            </span>
                        </div>
                        <GlassCard className="min-h-[300px]" delay={0.3}>
                            <TransactionForm type="expense" category="variable" defaultCategory="variable" className="mb-6" />
                            <TransactionList transactions={variableExpenses} />
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
