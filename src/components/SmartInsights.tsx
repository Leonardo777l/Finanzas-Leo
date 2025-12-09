import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from './ui/GlassCard';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export function SmartInsights() {
    const { transactions, goals, subscriptions } = useFinanceStore();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthExpenses = transactions
        .filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = transactions
        .filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getMonth() === currentMonth - 1 && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const expenseDiff = thisMonthExpenses - lastMonthExpenses;
    const expensePercent = lastMonthExpenses > 0 ? (expenseDiff / lastMonthExpenses) * 100 : 0;

    const totalSubscriptions = subscriptions.reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.amount : s.amount / 12), 0);

    const insights = [];

    if (expenseDiff > 0) {
        insights.push({
            type: 'warning',
            icon: TrendingUp,
            title: 'Alerta de Gasto',
            message: `Has gastado ${Math.abs(expensePercent).toFixed(1)}% más que el mes pasado. Revisa tus gastos variables.`
        });
    } else if (expenseDiff < 0) {
        insights.push({
            type: 'success',
            icon: TrendingDown,
            title: '¡Buen Trabajo!',
            message: `Has reducido tus gastos en un ${Math.abs(expensePercent).toFixed(1)}% comparado con el mes pasado.`
        });
    }

    if (totalSubscriptions > 100) {
        insights.push({
            type: 'info',
            icon: AlertCircle,
            title: 'Revisión de Suscripciones',
            message: `Gastas ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalSubscriptions)}/mes en suscripciones. Revisa si las usas todas.`
        });
    }

    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
    if (activeGoals.length > 0) {
        const topGoal = activeGoals[0];
        const remaining = topGoal.targetAmount - topGoal.currentAmount;
        insights.push({
            type: 'info',
            icon: Lightbulb,
            title: 'Enfoque en Meta',
            message: `Estás a ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(remaining)} de alcanzar tu meta "${topGoal.name}". ¡Sigue así!`
        });
    }

    if (insights.length === 0) {
        return null;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight, index) => (
                <GlassCard key={index} delay={0.5 + (index * 0.1)} className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${insight.type === 'warning' ? 'bg-rose-500/10 text-rose-400' :
                        insight.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-blue-500/10 text-blue-400'
                        }`}>
                        <insight.icon size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground">{insight.message}</p>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
