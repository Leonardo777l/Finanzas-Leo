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
    const [leoAmount, setLeoAmount] = useState('');
    const [ferAmount, setFerAmount] = useState('');
    const [bodaAmount, setBodaAmount] = useState('');
    const [inversionAmount, setInversionAmount] = useState('');
    const [gastoCorrienteAmount, setGastoCorrienteAmount] = useState('');
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
        const lAmount = Number(leoAmount) || 0;
        const fAmount = Number(ferAmount) || 0;
        const bAmount = Number(bodaAmount) || 0;
        const invAmount = Number(inversionAmount) || 0;
        const gcAmount = Number(gastoCorrienteAmount) || 0;

        const expenseTxs = [];
        if (lAmount > 0) {
            expenseTxs.push({
                date,
                description: `Pago Leo: ${concept}`,
                amount: lAmount,
                type: 'expense' as const,
                category: 'fixed' as const,
            });
        }
        if (fAmount > 0) {
            expenseTxs.push({
                date,
                description: `Pago Fer: ${concept}`,
                amount: fAmount,
                type: 'expense' as const,
                category: 'fixed' as const,
            });
        }
        if (bAmount > 0) {
            expenseTxs.push({
                date,
                description: `Boda: ${concept}`,
                amount: bAmount,
                type: 'expense' as const,
                category: 'fixed' as const,
            });
        }
        if (invAmount > 0) {
            expenseTxs.push({
                date,
                description: `Inversión: ${concept}`,
                amount: invAmount,
                type: 'expense' as const,
                category: 'fixed' as const,
            });
        }
        if (gcAmount > 0) {
            expenseTxs.push({
                date,
                description: `Gasto Corriente: ${concept}`,
                amount: gcAmount,
                type: 'expense' as const,
                category: 'fixed' as const,
            });
        }

        addTransactions([incomeTx, ...expenseTxs]);

        setAmount('');
        setConcept('');
        setLeoAmount('');
        setFerAmount('');
        setBodaAmount('');
        setInversionAmount('');
        setGastoCorrienteAmount('');
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

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-white">Distribución Manual</p>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs text-blue-400 w-16">Leo:</label>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                            <input
                                                type="number"
                                                value={leoAmount}
                                                onChange={(e) => setLeoAmount(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-white"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs text-pink-400 w-16">Fer:</label>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                            <input
                                                type="number"
                                                value={ferAmount}
                                                onChange={(e) => setFerAmount(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500/50 text-white"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs text-orange-400 w-16">Boda:</label>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                            <input
                                                type="number"
                                                value={bodaAmount}
                                                onChange={(e) => setBodaAmount(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 text-white"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs text-purple-400 w-16">Inversión:</label>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                            <input
                                                type="number"
                                                value={inversionAmount}
                                                onChange={(e) => setInversionAmount(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-white"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs text-emerald-400 w-[72px] shrink-0 leading-tight">Gasto Corriente:</label>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                            <input
                                                type="number"
                                                value={gastoCorrienteAmount}
                                                onChange={(e) => setGastoCorrienteAmount(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-white"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {Number(amount) > 0 && (
                                    <div className="pt-3 border-t border-white/10 mt-3 text-xs flex justify-between">
                                        <span className="text-muted-foreground">Restante en cuenta:</span>
                                        <span className={(Number(amount) - Number(leoAmount) - Number(ferAmount) - Number(bodaAmount) - Number(inversionAmount) - Number(gastoCorrienteAmount)) < 0 ? "text-red-400 font-mono" : "text-emerald-400 font-mono"}>
                                            ${(Number(amount) - Number(leoAmount) - Number(ferAmount) - Number(bodaAmount) - Number(inversionAmount) - Number(gastoCorrienteAmount)).toFixed(2)}
                                        </span>
                                    </div>
                                )}
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
