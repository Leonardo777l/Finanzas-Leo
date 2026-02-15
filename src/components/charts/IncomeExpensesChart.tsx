import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GlassCard } from '../../components/ui/GlassCard';
import { useFinanceStore } from '../../store/financeStore';
import { startOfMonth, subMonths, endOfMonth, format, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../../lib/utils';
import { useMemo } from 'react';
import type { Transaction } from '../../types';

export function IncomeExpensesChart() {
    const { transactions, currency } = useFinanceStore();

    const data = useMemo(() => {
        // Get last 6 months
        const today = new Date();
        const months = Array.from({ length: 6 }, (_, i) => {
            const date = subMonths(today, 5 - i);
            return {
                date,
                monthName: format(date, 'MMM', { locale: es }),
                fullName: format(date, 'MMMM yyyy', { locale: es }),
                income: 0,
                expense: 0
            };
        });

        // Aggregate data
        months.forEach(month => {
            const start = startOfMonth(month.date);
            const end = endOfMonth(month.date);

            const monthlyTx = transactions.filter((t: Transaction) =>
                isWithinInterval(parseISO(t.date), { start, end })
            );

            month.income = monthlyTx
                .filter((t: Transaction) => t.type === 'income')
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            month.expense = monthlyTx
                .filter((t: Transaction) => t.type === 'expense')
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        });

        return months;
    }, [transactions]);

    return (
        <GlassCard className="p-6 h-[400px] flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-white">Ingresos vs Gastos (Últimos 6 Meses)</h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="monthName"
                            stroke="#888888"
                            tick={{ fill: '#888888', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            tick={{ fill: '#888888', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            formatter={(value: number) => formatCurrency(value, currency)}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar
                            dataKey="income"
                            name="Ingresos"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                        <Bar
                            dataKey="expense"
                            name="Gastos"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
