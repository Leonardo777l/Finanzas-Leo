import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CashFlowChartProps {
    transactions: Transaction[];
}

export function CashFlowChart({ transactions }: CashFlowChartProps) {
    const monthlyData = transactions.reduce((acc, t) => {
        const monthKey = format(new Date(t.date), 'yyyy-MM');
        if (!acc[monthKey]) {
            acc[monthKey] = { month: monthKey, income: 0, expenses: 0, savings: 0 };
        }
        if (t.type === 'income') {
            acc[monthKey].income += t.amount;
        } else {
            acc[monthKey].expenses += t.amount;
        }
        return acc;
    }, {} as Record<string, { month: string; income: number; expenses: number; savings: number }>);

    Object.values(monthlyData).forEach(d => {
        d.savings = d.income - d.expenses;
    });

    const data = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-xl bg-white/5">
                No transaction data for projections
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis
                    dataKey="month"
                    tickFormatter={(str) => format(new Date(str), 'MMM yyyy')}
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)]}
                    labelFormatter={(label) => format(new Date(label), 'MMMM yyyy', { locale: es })}
                />
                <Legend />
                <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" name="Ahorro" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
