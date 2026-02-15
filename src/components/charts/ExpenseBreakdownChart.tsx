import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GlassCard } from '../../components/ui/GlassCard';
import { useFinanceStore } from '../../store/financeStore';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { formatCurrency } from '../../lib/utils';
import { useMemo } from 'react';
import type { Transaction } from '../../types';

const COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444'];

export function ExpenseBreakdownChart() {
    const { transactions, currency } = useFinanceStore();

    const data = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const monthlyExpenses = transactions.filter((t: Transaction) =>
            t.type === 'expense' &&
            isWithinInterval(parseISO(t.date), { start, end })
        );

        // Group by category
        // TODO: Refactor to allow more granular categories if available.
        // Currently we only have 'fixed' | 'variable' in many places,
        // but 'tag' or 'description' might be used for grouping?
        // Let's stick to Fixed vs Variable for now as per type definition.

        const fixed = monthlyExpenses
            .filter((t: Transaction) => t.category === 'fixed')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        const variable = monthlyExpenses
            .filter((t: Transaction) => t.category === 'variable')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        // Check for 'deudas' if we use that as a tag or category?
        // Note: Debt payments are currently saved as 'fixed'.
        // We could filter by description "Pago ..." or tag 'deudas' if implemented.
        const debts = monthlyExpenses
            .filter((t: Transaction) => t.tag === 'deudas')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        // Provide cleaner breakdown:
        // 1. Debts
        // 2. Fixed (excluding Debts)
        // 3. Variable

        const trueFixed = fixed - debts;

        return [
            { name: 'Gastos Fijos', value: trueFixed },
            { name: 'Gastos Variables', value: variable },
            { name: 'Deudas', value: debts }
        ].filter(d => d.value > 0);

    }, [transactions]);

    return (
        <GlassCard className="p-6 h-[400px] flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-white">Desglose de Gastos (Este Mes)</h3>
            <div className="flex-1 w-full relative">
                {data.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                        No hay gastos este mes
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: number) => formatCurrency(value, currency)}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </GlassCard>
    );
}
