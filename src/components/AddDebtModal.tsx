import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';

interface AddDebtModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddDebtModal({ isOpen, onClose }: AddDebtModalProps) {
    const addDebt = useFinanceStore((state) => state.addDebt);

    const [name, setName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [installments, setInstallments] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const calculateMonthly = () => {
        const amount = parseFloat(totalAmount);
        const months = parseInt(installments);
        if (amount && months) {
            return (amount / months).toFixed(2);
        }
        return '0.00';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseFloat(totalAmount);
        const months = parseInt(installments);

        if (!amount || !months || !name) return;

        addDebt({
            name,
            totalAmount: amount,
            remainingAmount: amount,
            totalInstallments: months,
            installmentsPaid: 0,
            startDate: new Date(startDate).toISOString(),
            monthlyAmount: amount / months,
            payments: []
        });

        setName('');
        setTotalAmount('');
        setInstallments('');
        setStartDate(new Date().toISOString().split('T')[0]);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Registrar Nueva Deuda</h3>
                            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Concepto</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white"
                                    placeholder="Ej: Lente 35mm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Monto Total</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        <DollarSign size={16} />
                                    </span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={totalAmount}
                                        onChange={(e) => setTotalAmount(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Mensualidades</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <CreditCard size={16} />
                                        </span>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            step="1"
                                            value={installments}
                                            onChange={(e) => setInstallments(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white"
                                            placeholder="12"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Fecha Inicio</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Calendar size={16} />
                                        </span>
                                        <input
                                            type="date"
                                            required
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-sm text-red-300">Pago Mensual Estimado:</span>
                                <span className="text-lg font-bold text-red-400">${calculateMonthly()}</span>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20"
                            >
                                Registrar Deuda
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
