import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { GlassCard } from '../../components/ui/GlassCard';
import { useFinanceStore } from '../../store/financeStore';
import { startOfMonth, subMonths, endOfMonth, format, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../../lib/utils';
import { useMemo } from 'react';
import type { Transaction } from '../../types';

export function BalanceTrendChart() {
    const { transactions, currency } = useFinanceStore();

    const data = useMemo(() => {
        // Get last 6 months
        const today = new Date();
        const months = Array.from({ length: 6 }, (_, i) => {
            const date = subMonths(today, 5 - i);
            return {
                monthName: format(date, 'MMM', { locale: es }),
                date,
                balance: 0
            };
        });

        months.forEach(month => {
            const start = startOfMonth(month.date);
            const end = endOfMonth(month.date);

            const monthlyTx = transactions.filter((t: Transaction) =>
                isWithinInterval(parseISO(t.date), { start, end })
            );

            const income = monthlyTx
                .filter((t: Transaction) => t.type === 'income')
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            const expense = monthlyTx
                .filter((t: Transaction) => t.type === 'expense')
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            month.balance = income - expense;
        });

        return months;
    }, [transactions]);

    return (
        <GlassCard className="p-6 h-[400px] flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-white">Tendencia de Ahorro Neto</h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
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
                            formatter={(value: number) => [formatCurrency(value, currency), 'Ahorro Neto']}
                        />
                        <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
