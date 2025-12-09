import { DollarSign, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { SummaryCard } from '../components/SummaryCard';
import { ExpenseChart } from '../components/ExpenseChart';
import { NetWorthChart } from '../components/NetWorthChart';
import { GlassCard } from '../components/ui/GlassCard';
import { SmartInsights } from '../components/SmartInsights';

export function Dashboard() {
    const { transactions, assets } = useFinanceStore();

    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalInvestments = assets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);

    const totalBalance = totalIncome - totalExpenses + totalInvestments;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Resumen Financiero
                </h2>
                <div className="text-sm text-muted-foreground">
                    Última actualización: Hoy
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Patrimonio Neto"
                    amount={totalBalance}
                    icon={DollarSign}
                    className="border-l-4 border-l-blue-500"
                    delay={0.1}
                />
                <SummaryCard
                    title="Ingresos Totales"
                    amount={totalIncome}
                    icon={TrendingUp}
                    className="border-l-4 border-l-emerald-500"
                    delay={0.2}
                />
                <SummaryCard
                    title="Gastos Totales"
                    amount={totalExpenses}
                    icon={TrendingDown}
                    className="border-l-4 border-l-rose-500"
                    delay={0.3}
                />
                <SummaryCard
                    title="Inversiones"
                    amount={totalInvestments}
                    icon={PiggyBank}
                    className="border-l-4 border-l-violet-500"
                    delay={0.4}
                />
            </div>

            <SmartInsights />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <GlassCard className="col-span-4 min-h-[400px]" delay={0.5}>
                    <h3 className="text-lg font-semibold mb-6">Tendencia de Patrimonio</h3>
                    <div className="h-[350px]">
                        <NetWorthChart transactions={transactions} />
                    </div>
                </GlassCard>

                <GlassCard className="col-span-3 min-h-[400px]" delay={0.6}>
                    <h3 className="text-lg font-semibold mb-6">Desglose de Gastos</h3>
                    <div className="h-[350px]">
                        <ExpenseChart transactions={transactions} />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
