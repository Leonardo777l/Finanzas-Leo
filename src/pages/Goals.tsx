import { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Plus, Target, Trash, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Goals() {
    const { goals, addGoal, updateGoal, removeGoal } = useFinanceStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal.name || !newGoal.targetAmount) return;

        addGoal({
            name: newGoal.name,
            targetAmount: Number(newGoal.targetAmount),
            currentAmount: 0,
            deadline: newGoal.deadline,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
        setNewGoal({ name: '', targetAmount: '', deadline: '' });
        setIsAdding(false);
    };

    const handleAddFunds = (id: string, current: number, target: number) => {
        const amount = prompt('How much to add?');
        if (amount) {
            const val = Number(amount);
            if (!isNaN(val)) {
                updateGoal(id, { currentAmount: Math.min(current + val, target) });
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Metas Financieras
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={16} />
                    Nueva Meta
                </button>
            </div>

            {isAdding && (
                <GlassCard className="max-w-md mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-lg font-semibold">Crear Nueva Meta</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre de la Meta</label>
                            <input
                                type="text"
                                value={newGoal.name}
                                onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="ej. Auto Nuevo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Monto Objetivo</label>
                            <input
                                type="number"
                                value={newGoal.targetAmount}
                                onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha Límite (Opcional)</label>
                            <input
                                type="date"
                                value={newGoal.deadline}
                                onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                            >
                                Crear Meta
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal, index) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    const isCompleted = progress >= 100;

                    return (
                        <GlassCard key={goal.id} delay={index * 0.1} className="relative group">
                            <button
                                onClick={() => removeGoal(goal.id)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash size={16} />
                            </button>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-white/5 text-primary">
                                    {isCompleted ? <CheckCircle size={24} className="text-emerald-400" /> : <Target size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                                    {goal.deadline && (
                                        <p className="text-xs text-muted-foreground">Meta: {new Date(goal.deadline).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progreso</span>
                                    <span className="font-medium">{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={`h-full ${isCompleted ? 'bg-emerald-400' : 'bg-primary'}`}
                                    />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(goal.currentAmount)}</span>
                                    <span className="text-muted-foreground">de {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(goal.targetAmount)}</span>
                                </div>
                            </div>

                            {!isCompleted && (
                                <button
                                    onClick={() => handleAddFunds(goal.id, goal.currentAmount, goal.targetAmount)}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Agregar Fondos
                                </button>
                            )}
                        </GlassCard>
                    );
                })}

                {goals.length === 0 && !isAdding && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Target size={48} className="mb-4 opacity-20" />
                        <p>No hay metas establecidas. ¡Empieza a ahorrar para algo especial!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
