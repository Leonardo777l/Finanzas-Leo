import { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { fetchBitsoBalances } from '../services/bitsoService';
import type { Asset } from '../types';
import { Loader2, Check, AlertCircle, Wallet } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function BitsoIntegration() {
    const {
        bitsoApiKeys,
        setBitsoKeys,
        addAsset,
        assets,
        updateAsset,
        isBitsoSyncing,
        setBitsoSyncing
    } = useFinanceStore();

    const [key, setKey] = useState(bitsoApiKeys?.key || '');
    const [secret, setSecret] = useState(bitsoApiKeys?.secret || '');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSaveKeys = () => {
        if (!key || !secret) {
            setError('Please enter both API Key and Secret');
            return;
        }
        setBitsoKeys({ key, secret });
        setSuccess('Keys saved locally');
        setTimeout(() => setSuccess(null), 3000);
        setError(null);
    };

    const handleSync = async () => {
        if (!bitsoApiKeys) {
            setError('Please save API keys first');
            return;
        }

        setBitsoSyncing(true);
        setError(null);
        setSuccess(null);

        try {
            const balances = await fetchBitsoBalances(bitsoApiKeys.key, bitsoApiKeys.secret);

            let addedCount = 0;
            let updatedCount = 0;

            balances.forEach(balance => {
                const symbol = balance.currency.toUpperCase();

                // Skip fiat currencies for now if not supported by Asset type
                if (['MXN', 'USD'].includes(symbol)) return;

                const quantity = parseFloat(balance.total);

                // Find existing asset from Bitso (using a simple convention or checking existing)
                // Since we don't have a 'source' field, we'll look for an asset with same symbol
                // and maybe update it if it seems to be the "Bitso" one, OR just add/update logic.
                // For simplified V1: Check if an asset with this symbol exists. 
                // If yes, and user wants "sync", we might overwrite quantity OR we might duplicate?
                // Duplication is bad.
                // Best approach: Search for asset with same symbol.

                const existingAsset = assets.find(a => a.symbol === symbol && a.type === 'crypto');

                if (existingAsset) {
                    // Update quantity
                    // NOTE: This might overwrite manual entries. 
                    // ideally we should have a 'source' field. 
                    // For now, let's assume if it exists, we update it to match Bitso (Sync functionality)
                    // Or maybe we should only touch "Bitso" flagged assets.
                    // Given the constraint, let's update quantity.
                    updateAsset(existingAsset.id, { quantity });
                    updatedCount++;
                } else {
                    // Add new asset
                    const newAsset: Omit<Asset, 'id'> = {
                        symbol,
                        name: symbol, // Could map to full name if we had a map
                        type: 'crypto',
                        quantity,
                        avgBuyPrice: 0, // Unknown from balance endpoint
                        currentPrice: 0, // Will be fetched by market data
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
                setError('Failed to sync with Bitso');
            }
        } finally {
            setBitsoSyncing(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg transition-colors"
                title="Conectar Bitso"
            >
                <Wallet size={16} />
                <span>Integrar Bitso</span>
            </button>
        );
    }

    return (
        <GlassCard className="p-4 space-y-4 border-emerald-500/20 relative">
            <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-white"
            >
                ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
                <Wallet className="text-emerald-400" size={20} />
                <h3 className="font-semibold text-emerald-100">Bitso Integration</h3>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">API Key</label>
                    <input
                        type="text"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="Bitso API Key"
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">API Secret</label>
                    <input
                        type="password"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="Bitso API Secret"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-400/10 p-2 rounded">
                        <AlertCircle size={12} />
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
                        Save Keys
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={isBitsoSyncing || !bitsoApiKeys}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isBitsoSyncing ? <Loader2 size={12} className="animate-spin" /> : 'Sync Assets'}
                    </button>
                </div>

                <p className="text-[10px] text-muted-foreground mt-2">
                    * Requires "View Balances" permission.<br />
                    * Check browser console for CORS errors if sync fails.
                </p>
            </div>
        </GlassCard>
    );
}
