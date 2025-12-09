import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Asset } from '../types';

interface AllocationChartProps {
    assets: Asset[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#a855f7'];

export function AllocationChart({ assets }: AllocationChartProps) {
    const data = assets.map(a => ({
        name: a.symbol,
        value: a.quantity * a.currentPrice
    })).filter(d => d.value > 0);

    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-xl bg-white/5">
                No asset data available
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
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
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
                    formatter={(value: number) => [new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value), 'Valor']}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}
