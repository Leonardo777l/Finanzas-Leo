import { type ReactNode } from 'react';
import { LayoutDashboard, Calendar, Wallet, TrendingUp, Settings, Menu, X, Target, CreditCard, CalendarDays, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { SyncStatus } from './SyncStatus';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
        { id: 'planner', label: 'Planeador Mensual', icon: Calendar },
        { id: 'calendar', label: 'Calendario', icon: CalendarDays },
        { id: 'portfolio', label: 'Inversiones', icon: Wallet },
        { id: 'goals', label: 'Metas', icon: Target },
        { id: 'subscriptions', label: 'Suscripciones', icon: CreditCard },
        { id: 'cashflow', label: 'Flujo de Caja', icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="w-72 hidden md:flex flex-col p-6 relative z-10">
                <div className="mb-10 px-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tighter">
                        FinDash
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Gestor Financiero Premium</p>
                    <SyncStatus />
                </div>

                <nav className="space-y-2 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:text-white"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary/80 backdrop-blur-sm"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-4">
                                    <Icon size={22} className={cn("transition-transform duration-300", isActive && "scale-110")} />
                                    <span className="font-medium tracking-wide">{item.label}</span>
                                </span>
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all">
                        <Settings size={22} />
                        <span className="font-medium">Configuración</span>
                    </button>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                    >
                        <LogOut size={22} />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative z-0">
                <header className="md:hidden h-16 border-b border-white/10 flex items-center justify-between px-4 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            FinDash
                        </h1>
                        <SyncStatus />
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="md:hidden absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/10 p-4 z-40"
                        >
                            <nav className="space-y-2">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onTabChange(item.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                                            activeTab === item.id ? "bg-primary/20 text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </button>
                                ))}
                                <div className="pt-4 mt-4 border-t border-white/10">
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
                                    >
                                        <LogOut size={20} />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
