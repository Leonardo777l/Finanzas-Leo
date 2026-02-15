import { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from '../components/ui/GlassCard';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, UserCircle, Truck, Wallet, Banknote } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { SummaryCard } from '../components/SummaryCard';
import { IncomeExpensesChart } from '../components/charts/IncomeExpensesChart';
import { ExpenseBreakdownChart } from '../components/charts/ExpenseBreakdownChart';
import { BalanceTrendChart } from '../components/charts/BalanceTrendChart';

export function Dashboard() {
    const { transactions, currency } = useFinanceStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate((prev) => (direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)));
    };

    const stats = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);

        // Filter transactions for the selected month
        const monthlyTransactions = transactions.filter((t) => {
            const date = parseISO(t.date);
            return isWithinInterval(date, { start, end });
        });

        const totalIncome = monthlyTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        // Calculate Distributions based on percentages of Total Income
        return {
            leo: totalIncome * 0.10,
            fer: totalIncome * 0.10,
            mudanza: totalIncome * 0.20,
            ahorro: totalIncome * 0.10,
            gastoCorriente: totalIncome * 0.50,
            totalIncome
        };
    }, [transactions, currentDate]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Distribución Mensual
                </h2>

                {/* Month Selector */}
                <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="w-40 text-center font-medium capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Distribution Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <SummaryCard
                    title="Leo (10%)"
                    amount={stats.leo}
                    icon={UserCircle}
                    className="border-l-4 border-l-blue-500"
                    delay={0.1}
                />
                <SummaryCard
                    title="Fer (10%)"
                    amount={stats.fer}
                    icon={UserCircle}
                    className="border-l-4 border-l-pink-500"
                    delay={0.2}
                />
                <SummaryCard
                    title="Mudanza (20%)"
                    amount={stats.mudanza}
                    icon={Truck}
                    className="border-l-4 border-l-orange-500"
                    delay={0.3}
                />
                <SummaryCard
                    title="Ahorro (10%)"
                    amount={stats.ahorro}
                    icon={Wallet}
                    className="border-l-4 border-l-emerald-500"
                    delay={0.4}
                />
                <SummaryCard
                    title="Gasto Cte. (50%)"
                    amount={stats.gastoCorriente}
                    icon={Banknote}
                    className="border-l-4 border-l-white"
                    delay={0.5}
                />
            </div>

            <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Total Generado en {format(currentDate, 'MMMM', { locale: es })}</h3>
                <p className="text-4xl font-bold text-white tracking-tight">
                    {formatCurrency(stats.totalIncome, currency)}
                </p>
            </GlassCard>

            {/* Statistical Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                <IncomeExpensesChart />
                <ExpenseBreakdownChart />
                <div className="lg:col-span-2">
                    <BalanceTrendChart />
                </div>
            </div>

        </div >
    );
}
