import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from './ui/GlassCard';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';
import { clsx } from 'clsx';
import { Debt } from '../types';
import { format, addMonths, parseISO, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface DebtCardProps {
    debt: Debt;
}

export function DebtCard({ debt }: DebtCardProps) {
    const { payInstallment, currency } = useFinanceStore();

    // Generate array of all installment months
    const installments = Array.from({ length: debt.totalInstallments }, (_, i) => {
        const date = addMonths(parseISO(debt.startDate), i);
        return {
            index: i + 1,
            date,
            monthStr: format(date, 'yyyy-MM'), // For comparison
            displayDate: format(date, 'MMM yy', { locale: es }),
            isPaid: debt.payments.some(p => isSameMonth(parseISO(p), date))
        };
    });

    const handleTogglePayment = (paymentDate: string) => {
        // Only allow paying, removing payments might be complex regarding transactions
        payInstallment(debt.id, paymentDate);
    };

    const progress = (debt.installmentsPaid / debt.totalInstallments) * 100;

    return (
        <GlassCard className="p-6 border-l-4 border-l-red-500">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white">{debt.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        Inicio: {format(parseISO(debt.startDate), 'dd MMMM yyyy', { locale: es })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-red-400">
                        {formatCurrency(debt.remainingAmount, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">RESTANTE</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progreso de Pagos</span>
                        <span>{debt.installmentsPaid} / {debt.totalInstallments} Mensualidades</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Installments Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {installments.map((inst) => (
                        <button
                            key={inst.index}
                            disabled={inst.isPaid}
                            onClick={() => handleTogglePayment(inst.date.toISOString())}
                            className={clsx(
                                "flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all",
                                inst.isPaid
                                    ? "bg-red-500/10 border-red-500/30 text-red-400 cursor-default"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer"
                            )}
                            title={inst.isPaid ? "Pagado" : "Marcar como pagado"}
                        >
                            <div className="mb-1">
                                {inst.isPaid ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                            </div>
                            <span className="font-mono">{inst.index}</span>
                            <span className="text-[10px] opacity-70 capitalize">{inst.displayDate}</span>
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Mensualidad:</span>
                    <span className="font-bold text-white">{formatCurrency(debt.monthlyAmount, currency)}</span>
                </div>
            </div>
        </GlassCard>
    );
}
