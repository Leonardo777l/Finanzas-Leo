import { cn } from '../lib/utils';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

interface SummaryCardProps {
    title: string;
    amount: number;
    icon: LucideIcon;
    trend?: number;
    className?: string;
    delay?: number;
}

export function SummaryCard({ title, amount, icon: Icon, trend, className, delay }: SummaryCardProps) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);

    return (
        <GlassCard hoverEffect delay={delay} className={cn("relative overflow-hidden", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon size={100} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-white/5">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-3xl font-bold tracking-tight">{formattedAmount}</div>
                    {trend !== undefined && (
                        <p className={cn("text-xs font-medium flex items-center gap-1", trend >= 0 ? "text-emerald-400" : "text-rose-400")}>
                            {trend > 0 ? '+' : ''}{trend}%
                            <span className="text-muted-foreground opacity-60">from last month</span>
                        </p>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}
