import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Transaction } from '../types';

interface ExpenseChartProps {
    transactions: Transaction[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function ExpenseChart({ transactions }: ExpenseChartProps) {
    const expenses = transactions.filter(t => t.type === 'expense');

    const dataMap = expenses.reduce((acc, curr) => {
        const key = curr.tag || curr.category || 'Other';
        acc[key] = (acc[key] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(dataMap).map(([name, value]) => ({ name, value }));

    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-xl bg-white/5">
                No expense data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    innerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value), 'Monto']}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}
