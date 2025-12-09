import { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { PieChart, ChevronLeft, ChevronRight, Wallet, Shield, Heart, Banknote, Landmark, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { GlassCard as Card } from '../components/ui/GlassCard';
import { formatCurrency } from '../lib/utils';
import { clsx } from 'clsx';

export function Distribution() {
    const { transactions, currency } = useFinanceStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    const stats = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);

        const monthlyTransactions = transactions.filter((t) => {
            const date = parseISO(t.date);
            return isWithinInterval(date, { start, end });
        });

        const totalIncome = monthlyTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = monthlyTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Distribution Model: 50% / 20% / 10% / 10% / 10%
        const plan = {
            fixedExpenses: totalIncome * 0.50, // 50% - Gastos Fijos (Realmente para todos los gastos)
            dividends: totalIncome * 0.20,     // 20% - Dividendos
            savings: totalIncome * 0.10,       // 10% - Ahorro
            safeBox: totalIncome * 0.10,       // 10% - Caja Fuerte
            tithe: totalIncome * 0.10,         // 10% - Diezmo
        };

        const expenses = monthlyTransactions.filter(t => t.type === 'expense');

        return {
            totalIncome,
            totalExpenses,
            plan,
            expenses
        };
    }, [transactions, currentDate]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate((prev) => (direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Month Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Distribución de Ingresos
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Modelo 50/20/10/10/10 para auditoría financiera
                    </p>
                </div>

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

            {/* Total Income Display */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                        <Banknote size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Ingresos Totales</p>
                        <p className="text-3xl font-bold text-green-400">
                            {formatCurrency(stats.totalIncome, currency)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Reality Check Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <PieChart className="text-purple-400" size={20} />
                            Ingresos vs Gastos
                        </h3>
                    </div>
                    <div className="space-y-6">
                        {/* 50% Allowance vs Real Expenses */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tu Límite de Gastos (50% de Ingresos)</span>
                                <span className="font-semibold text-purple-400">{formatCurrency(stats.plan.fixedExpenses, currency)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Gastos Reales (Fijos + Variables)</span>
                                <span className={clsx("font-semibold", stats.totalExpenses > stats.plan.fixedExpenses ? "text-red-400" : "text-green-400")}>
                                    {formatCurrency(stats.totalExpenses, currency)}
                                </span>
                            </div>

                            {/* Status Bar */}
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden relative">
                                {/* The Target Bar (50%) */}
                                <div
                                    className="absolute top-0 bottom-0 left-0 bg-white/10 border-r-2 border-dashed border-white/30 z-10"
                                    style={{ width: '50%' }}
                                    title="Meta del 50%"
                                />

                                {/* The Actual Usage Bar */}
                                <motion.div
                                    className={clsx(
                                        "h-full rounded-full",
                                        stats.totalExpenses > stats.plan.fixedExpenses ? "bg-red-500" : "bg-green-500"
                                    )}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((stats.totalExpenses / stats.totalIncome) * 100, 100)}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>

                            <div className="pt-2">
                                {stats.totalExpenses > stats.plan.fixedExpenses ? (
                                    <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        <AlertTriangle size={16} />
                                        <span>
                                            ¡Cuidado! Estás gastando más del 50% de tus ingresos.
                                            Te faltan <strong>{formatCurrency(stats.totalExpenses - stats.plan.fixedExpenses, currency)}</strong> para ajustar tu presupuesto.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-300 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                        <CheckCircle2 size={16} />
                                        <span>
                                            ¡Excelente! Tus gastos están dentro del 50% por <strong>{formatCurrency(stats.plan.fixedExpenses - stats.totalExpenses, currency)}</strong>.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Distribution Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <DistributionCard
                        title="Inversiones (20%)"
                        amount={stats.plan.dividends}
                        currency={currency}
                        icon={Landmark}
                        color="text-blue-400"
                        bgColor="bg-blue-400/10"
                    />
                    <DistributionCard
                        title="Ahorro (10%)"
                        amount={stats.plan.savings}
                        currency={currency}
                        icon={Wallet}
                        color="text-emerald-400"
                        bgColor="bg-emerald-400/10"
                    />
                    <DistributionCard
                        title="Caja Fuerte (10%)"
                        amount={stats.plan.safeBox}
                        currency={currency}
                        icon={Shield}
                        color="text-amber-400"
                        bgColor="bg-amber-400/10"
                    />
                    <DistributionCard
                        title="Diezmo (10%)"
                        amount={stats.plan.tithe}
                        currency={currency}
                        icon={Heart}
                        color="text-rose-400"
                        bgColor="bg-rose-400/10"
                    />
                </div>
            </div>

            {/* Comparison Table */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold">Análisis de Gastos</h3>
                <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    <div className="p-4 grid grid-cols-[1fr,auto] md:grid-cols-[auto,1fr,1fr,auto] gap-4 text-sm font-medium text-muted-foreground border-b border-white/10 bg-black/20">
                        <div className="hidden md:block">Fecha</div>
                        <div>Descripción</div>
                        <div className="hidden md:block">Categoría</div>
                        <div className="text-right">Monto</div>
                    </div>

                    <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {stats.expenses.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No hay gastos registrados en este mes.
                            </div>
                        ) : (
                            stats.expenses.map((expense) => (
                                <div key={expense.id} className="p-4 grid grid-cols-[1fr,auto] md:grid-cols-[auto,1fr,1fr,auto] gap-4 items-center hover:bg-white/5 transition-colors">
                                    <div className="hidden md:block text-sm text-neutral-400">
                                        {format(parseISO(expense.date), 'dd MMM', { locale: es })}
                                    </div>
                                    <div className="font-medium">{expense.description}</div>
                                    <div className="hidden md:block">
                                        <span className={clsx(
                                            "px-2 py-1 rounded-full text-xs font-medium border",
                                            expense.category === 'fixed'
                                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        )}>
                                            {expense.category === 'fixed' ? 'Gasto Fijo' : 'Gasto Variable'}
                                        </span>
                                    </div>
                                    <div className="text-right font-mono text-red-400">
                                        -{formatCurrency(expense.amount, currency)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DistributionCard({ title, amount, currency, icon: Icon, color, bgColor }: any) {
    return (
        <Card className="p-4 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
                <Icon className={color} size={20} />
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">{title}</p>
            <p className={`text-xl font-bold ${color}`}>
                {formatCurrency(amount, currency)}
            </p>
        </Card>
    );
}
