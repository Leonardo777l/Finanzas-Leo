import { useFinanceStore } from '../store/financeStore';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SyncStatus() {
    const { syncStatus, syncError } = useFinanceStore();

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <AnimatePresence mode="wait">
                {syncStatus === 'synced' && (
                    <motion.div
                        key="synced"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-green-400"
                    >
                        <Cloud className="w-4 h-4" />
                        <span className="text-xs font-medium">Sincronizado</span>
                    </motion.div>
                )}

                {syncStatus === 'syncing' && (
                    <motion.div
                        key="syncing"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-yellow-400"
                    >
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-medium">Sincronizando...</span>
                    </motion.div>
                )}

                {syncStatus === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-red-400 group relative cursor-help"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Error</span>

                        {/* Tooltip */}
                        <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-red-900/90 text-white text-xs rounded border border-red-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {syncError || 'Error desconocido'}
                        </div>
                    </motion.div>
                )}

                {syncStatus === 'offline' && (
                    <motion.div
                        key="offline"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-muted-foreground"
                    >
                        <CloudOff className="w-4 h-4" />
                        <span className="text-xs font-medium">Offline</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
