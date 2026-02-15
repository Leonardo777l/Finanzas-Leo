import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';

interface SmartIncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SmartIncomeModal({ isOpen, onClose }: SmartIncomeModalProps) {
    const [amount, setAmount] = useState('');
    const [concept, setConcept] = useState('');
    const addTransactions = useFinanceStore((state) => state.addTransactions);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = Number(amount);
        if (!numAmount || !concept) return;

        const date = new Date().toISOString();
        // 1. Create the Income Transaction
        const incomeTx = {
            date,
            description: concept,
            amount: numAmount,
            type: 'income' as const,
            category: 'variable' as const,
        };

        // 2. Create the Split Expenses
        // New Model: Leo (10%), Fer (10%), Mudanza (20%), Ahorro (10%), Gasto Corriente (50%)
        const leoAmount = numAmount * 0.10;
        const ferAmount = numAmount * 0.10;
        const mudanzaAmount = numAmount * 0.20;
        // Ahorro (10%) and Gasto Corriente (50%) remain in account

        const expenseTxs = [
            {
                date,
                description: `Pago Leo (10%): ${concept}`,
                amount: leoAmount,
                type: 'expense' as const,
                category: 'fixed' as const,
            },
            {
                date,
                description: `Pago Fer (10%): ${concept}`,
                amount: ferAmount,
                type: 'expense' as const,
                category: 'fixed' as const,
            },
            {
                date,
                description: `Mudanza (20%): ${concept}`,
                amount: mudanzaAmount,
                type: 'expense' as const,
                category: 'fixed' as const,
            }
        ];

        addTransactions([incomeTx, ...expenseTxs]);

        setAmount('');
        setConcept('');
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
                            <h3 className="text-xl font-bold text-white">Registrar Ingreso Inteligente</h3>
                            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Monto del Ingreso</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <input
                                        type="number"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Concepto</label>
                                <input
                                    type="text"
                                    required
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                    placeholder="Ej: Nómina, Venta..."
                                />
                            </div>

                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-semibold text-emerald-400 mb-2">Distribución Automática:</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div>Leo (10%): <span className="text-blue-400 font-mono">${(Number(amount) * 0.10).toFixed(2)}</span></div>
                                    <div>Fer (10%): <span className="text-pink-400 font-mono">${(Number(amount) * 0.10).toFixed(2)}</span></div>
                                    <div>Mudanza (20%): <span className="text-orange-400 font-mono">${(Number(amount) * 0.20).toFixed(2)}</span></div>
                                    <div>Ahorro (10%): <span className="text-emerald-400 font-mono">${(Number(amount) * 0.10).toFixed(2)}</span></div>
                                    <div className="col-span-2 border-t border-white/5 pt-2 mt-1">
                                        Gasto Corriente (50%): <span className="text-white font-mono">${(Number(amount) * 0.50).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Confirmar y Distribuir
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
