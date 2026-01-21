import { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { fetchIbkrPortfolio } from '../services/ibkrService';
import type { Asset } from '../types';
import { Loader2, Check, AlertCircle, Building2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function IbkrIntegration() {
    const {
        ibkrCredentials,
        setIbkrCredentials,
        addAsset,
        assets,
        updateAsset,
        isIbkrSyncing,
        setIbkrSyncing
    } = useFinanceStore();

    // Defaults provided by user
    const DEFAULT_TOKEN = '41083274288911012200493';
    const DEFAULT_QUERY_ID = '1380920';

    const [token, setToken] = useState(ibkrCredentials?.token || DEFAULT_TOKEN);
    const [queryId, setQueryId] = useState(ibkrCredentials?.queryId || DEFAULT_QUERY_ID);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSaveKeys = () => {
        if (!token || !queryId) {
            setError('Please enter both Token and Query ID');
            return;
        }
        setIbkrCredentials({ token, queryId });
        setSuccess('Credentials saved locally');
        setTimeout(() => setSuccess(null), 3000);
        setError(null);
    };

    const handleSync = async () => {
        if (!ibkrCredentials) {
            setError('Please save credentials first');
            return;
        }

        setIbkrSyncing(true);
        setError(null);
        setSuccess(null);

        try {
            const positions = await fetchIbkrPortfolio(ibkrCredentials);

            let addedCount = 0;
            let updatedCount = 0;

            positions.forEach(pos => {
                const symbol = pos.symbol.toUpperCase();

                // Check if asset exists
                const existingAsset = assets.find(a => a.symbol === symbol && a.type === 'stock');

                if (existingAsset) {
                    updateAsset(existingAsset.id, {
                        quantity: pos.quantity,
                        avgBuyPrice: pos.avgBuyPrice,
                        currentPrice: pos.currentPrice // IBKR gives mark price, which is good
                    });
                    updatedCount++;
                } else {
                    const newAsset: Omit<Asset, 'id'> = {
                        symbol,
                        name: pos.name || symbol,
                        type: 'stock',
                        quantity: pos.quantity,
                        avgBuyPrice: pos.avgBuyPrice,
                        currentPrice: pos.currentPrice,
                    };
                    addAsset(newAsset);
                    addedCount++;
                }
            });

            setSuccess(`Sync successful: ${addedCount} added, ${updatedCount} updated.`);
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to sync with IBKR');
            }
        } finally {
            setIbkrSyncing(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
                title="Conectar Interactive Brokers"
            >
                <Building2 size={16} />
                <span>Integrar IBKR</span>
            </button>
        );
    }

    return (
        <GlassCard className="p-4 space-y-4 border-blue-500/20 relative w-80">
            <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-white"
            >
                ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
                <Building2 className="text-blue-400" size={20} />
                <h3 className="font-semibold text-blue-100">IBKR Integration</h3>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Flex Query Token</label>
                    <input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="Token from Account Management"
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Query ID</label>
                    <input
                        type="text"
                        value={queryId}
                        onChange={(e) => setQueryId(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="ID of your Flex Query"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-400/10 p-2 rounded break-all">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 p-2 rounded">
                        <Check size={12} />
                        <span>{success}</span>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleSaveKeys}
                        className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={isIbkrSyncing || !ibkrCredentials}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isIbkrSyncing ? <Loader2 size={12} className="animate-spin" /> : 'Sync'}
                    </button>
                </div>

                <p className="text-[10px] text-muted-foreground mt-2">
                    * Uses Flex Web Service.<br />
                    * Create a query with "Open Positions" XML format.
                </p>
            </div>
        </GlassCard>
    );
}
