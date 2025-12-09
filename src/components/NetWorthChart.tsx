import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NetWorthChartProps {
    transactions: Transaction[];
}

export function NetWorthChart({ transactions }: NetWorthChartProps) {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const data = sorted.map(t => {
        runningBalance += t.type === 'income' ? t.amount : -t.amount;
        return {
            date: t.date,
            amount: runningBalance
        };
    });

    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-xl bg-white/5">
                No transaction history
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis
                    dataKey="date"
                    tickFormatter={(str) => format(new Date(str), 'MMM d')}
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
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value), 'Patrimonio']}
                    labelFormatter={(label) => format(new Date(label), "d 'de' MMMM", { locale: es })}
                />
                <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
