import { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Plus, CreditCard, Trash, Calendar } from 'lucide-react';

export function Subscriptions() {
    const { subscriptions, addSubscription, removeSubscription } = useFinanceStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newSub, setNewSub] = useState({ name: '', amount: '', billingCycle: 'monthly', nextBillingDate: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSub.name || !newSub.amount) return;

        addSubscription({
            name: newSub.name,
            amount: Number(newSub.amount),
            billingCycle: newSub.billingCycle as 'monthly' | 'yearly',
            nextBillingDate: newSub.nextBillingDate || new Date().toISOString().split('T')[0]
        });
        setNewSub({ name: '', amount: '', billingCycle: 'monthly', nextBillingDate: '' });
        setIsAdding(false);
    };

    const totalMonthly = subscriptions.reduce((sum, sub) => {
        return sum + (sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12);
    }, 0);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Suscripciones
                </h2>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Costo Mensual</p>
                    <p className="text-2xl font-bold text-rose-400">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalMonthly)}
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={16} />
                    Agregar Suscripción
                </button>
            </div>

            {isAdding && (
                <GlassCard className="max-w-md mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-lg font-semibold">Agregar Suscripción</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre del Servicio</label>
                            <input
                                type="text"
                                value={newSub.name}
                                onChange={e => setNewSub({ ...newSub, name: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="ej. Netflix"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Monto</label>
                                <input
                                    type="number"
                                    value={newSub.amount}
                                    onChange={e => setNewSub({ ...newSub, amount: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ciclo de Facturación</label>
                                <select
                                    value={newSub.billingCycle}
                                    onChange={e => setNewSub({ ...newSub, billingCycle: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="monthly">Mensual</option>
                                    <option value="yearly">Anual</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Próxima Fecha de Pago</label>
                            <input
                                type="date"
                                value={newSub.nextBillingDate}
                                onChange={e => setNewSub({ ...newSub, nextBillingDate: e.target.value })}
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
                                Agregar Suscripción
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subscriptions.map((sub, index) => (
                    <GlassCard key={sub.id} delay={index * 0.1} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white/5 text-primary">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{sub.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar size={12} />
                                    <span>Próximo: {new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(sub.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {sub.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
                            </p>
                        </div>
                        <button
                            onClick={() => removeSubscription(sub.id)}
                            className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash size={16} />
                        </button>
                    </GlassCard>
                ))}

                {subscriptions.length === 0 && !isAdding && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <CreditCard size={48} className="mb-4 opacity-20" />
                        <p>No hay suscripciones registradas. Agrega tus pagos recurrentes aquí.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
