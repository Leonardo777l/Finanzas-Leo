import { useEffect } from 'react';
import { AssetList } from '../components/AssetList';
import { AllocationChart } from '../components/AllocationChart';
import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from '../components/ui/GlassCard';
import { useMarketData } from '../hooks/useMarketData';
import { RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

import { BitsoIntegration } from '../components/BitsoIntegration';
import { IbkrIntegration } from '../components/IbkrIntegration';

export function Portfolio() {
    const { assets, removeAsset, updateAsset } = useFinanceStore();
    const { refreshPrices, isLoading, lastUpdated } = useMarketData();

    // One-time auto-import for the user's Bitso image data
    useEffect(() => {
        if (!localStorage.getItem('has_imported_bitso_images_2026_v3')) {
            localStorage.setItem('has_imported_bitso_images_2026_v3', 'true');
            
            setTimeout(() => {
                const store = useFinanceStore.getState();
                
                // Remove existing crypto assets to ensure no duplicates
                const existingCryptos = store.assets.filter(a => a.type === 'crypto');
                existingCryptos.forEach(a => store.removeAsset(a.id));

                const assetsToAdd = [
                    { symbol: 'RENDER', name: 'Render', type: 'crypto' as const, quantity: 353.31325747, avgBuyPrice: 0, currentPrice: 0 },
                    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' as const, quantity: 0.00833442, avgBuyPrice: 0, currentPrice: 0 },
                    { symbol: 'ETH', name: 'Ether', type: 'crypto' as const, quantity: 0.12886523, avgBuyPrice: 0, currentPrice: 0 },
                    { symbol: 'XRP', name: 'XRP', type: 'crypto' as const, quantity: 164.723173, avgBuyPrice: 0, currentPrice: 0 },
                    { symbol: 'SOL', name: 'Solana', type: 'crypto' as const, quantity: 0.21905838, avgBuyPrice: 0, currentPrice: 0 },
                ];
                
                assetsToAdd.forEach(a => store.addAsset(a as any));
                refreshPrices();
            }, 3000); // Wait 3s for initial firebase sync to settle
        }
    }, [refreshPrices]);

    // One-time auto-import for the user's IBKR image data and clear wrong SP500 entry
    useEffect(() => {
        if (!localStorage.getItem('has_imported_ibkr_images_2026_v2')) {
            localStorage.setItem('has_imported_ibkr_images_2026_v2', 'true');
            
            setTimeout(() => {
                const store = useFinanceStore.getState();
                
                // Remove existing stock assets to ensure no duplicates
                const existingStocks = store.assets.filter(a => a.type === 'stock');
                existingStocks.forEach(a => store.removeAsset(a.id));

                const stocksToAdd = [
                    { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', type: 'stock' as const, quantity: 0.2248, avgBuyPrice: 695.66, currentPrice: 158.79 / 0.2248, currentPriceUSD: 158.79 / 0.2248 },
                    { symbol: 'PHYS', name: 'Sprott Physical Gold Trust', type: 'stock' as const, quantity: 3.4519, avgBuyPrice: 35.11, currentPrice: 125.86 / 3.4519, currentPriceUSD: 125.86 / 3.4519 },
                    { symbol: 'PLTR', name: 'Palantir Technologies', type: 'stock' as const, quantity: 1.2029, avgBuyPrice: 179.19, currentPrice: 173.88 / 1.2029, currentPriceUSD: 173.88 / 1.2029 },
                    { symbol: 'TSLA', name: 'Tesla Inc', type: 'stock' as const, quantity: 0.4163, avgBuyPrice: 459.54, currentPrice: 162.51 / 0.4163, currentPriceUSD: 162.51 / 0.4163 },
                    { symbol: 'URA', name: 'Global X Uranium ETF', type: 'stock' as const, quantity: 6.1762, avgBuyPrice: 48.97, currentPrice: 343.15 / 6.1762, currentPriceUSD: 343.15 / 6.1762 },
                ];

                stocksToAdd.forEach(a => store.addAsset(a as any));
            }, 3500); // executed slightly after bitso to prevent collision
        }
    }, []);

    // Helper to group assets by symbol
    const groupAssets = (assetsToGroup: typeof assets) => {
        const grouped = assetsToGroup.reduce((acc, asset) => {
            // Normalize symbol: remove whitespace and uppercase
            const normalizedSymbol = asset.symbol.trim().toUpperCase();

            if (!acc[normalizedSymbol]) {
                acc[normalizedSymbol] = {
                    ...asset,
                    symbol: normalizedSymbol, // Ensure aggregated asset has normalized symbol
                    id: `agg-${normalizedSymbol}`, // Synthetic ID
                    quantity: 0,
                    avgBuyPrice: 0,
                    // We'll store total cost basis to calculate avg price later
                    _totalCost: 0,
                    subAssets: [] as typeof assets
                };
            }

            acc[normalizedSymbol].quantity += asset.quantity;
            // Accumulate weighted cost
            acc[normalizedSymbol]._totalCost += (asset.quantity * asset.avgBuyPrice);
            // Keep latest current price (assuming all entries of same asset should have same market price)
            acc[normalizedSymbol].currentPrice = asset.currentPrice;
            acc[normalizedSymbol].currentPriceUSD = asset.currentPriceUSD;

            // Add original asset to subAssets
            acc[normalizedSymbol].subAssets.push(asset);

            return acc;
        }, {} as Record<string, typeof assets[0] & { _totalCost: number, subAssets: typeof assets }>);

        return Object.values(grouped).map(asset => ({
            ...asset,
            avgBuyPrice: asset.quantity > 0 ? asset._totalCost / asset.quantity : 0
        }));
    };

    const cryptoAssetsRaw = assets.filter(a => a.type === 'crypto');
    const stockAssetsRaw = assets.filter(a => a.type === 'stock');

    const cryptoAssets = groupAssets(cryptoAssetsRaw);
    const stockAssets = groupAssets(stockAssetsRaw);
    const allAggregatedAssets = [...cryptoAssets, ...stockAssets];


    // Calculate Total Value in USD
    const totalCryptoValueUSD = cryptoAssets.reduce((sum, a) => sum + (a.quantity * (a.currentPriceUSD || 0)), 0);
    const totalStocksValueUSD = stockAssets.reduce((sum, a) => sum + (a.quantity * (a.currentPriceUSD || 0)), 0);
    const totalPortfolioValueUSD = totalCryptoValueUSD + totalStocksValueUSD;

    // Total Cost Basis (Invested) - Assuming this is in USD as per user request
    const totalInvested = assets.reduce((sum, a) => sum + (a.quantity * a.avgBuyPrice), 0);

    // Calculate approximate exchange rate from available assets (MXN / USD)
    const exchangeRate = allAggregatedAssets.reduce((rate, asset) => {
        if (asset.currentPrice > 0 && asset.currentPriceUSD && asset.currentPriceUSD > 0) {
            return asset.currentPrice / asset.currentPriceUSD;
        }
        return rate;
    }, 20); // Fallback to 20 if no valid prices

    const totalInvestedMXN = totalInvested * exchangeRate;

    // Total Return (USD based if invested is USD)
    const totalReturnUSD = totalPortfolioValueUSD - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalReturnUSD / totalInvested) * 100 : 0;

    const handleRemoveAsset = (symbol: string) => {
        // Remove all assets defined by this symbol
        const assetsToRemove = assets.filter(a => a.symbol === symbol);
        assetsToRemove.forEach(a => removeAsset(a.id));
    };

    const handleUpdateAsset = (symbol: string, updates: Partial<typeof assets[0]>) => {
        // If updating price, update for all entries of this asset
        const assetsToUpdate = assets.filter(a => a.symbol === symbol);
        assetsToUpdate.forEach(a => updateAsset(a.id, updates));
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Portafolio de Inversión
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                            {lastUpdated ? `Actualizado: ${lastUpdated.toLocaleTimeString()}` : 'Precios en tiempo real'}
                        </p>
                        <button
                            onClick={refreshPrices}
                            disabled={isLoading}
                            className={clsx("p-1 rounded-full hover:bg-white/10 transition-colors", isLoading && "animate-spin")}
                            title="Actualizar precios"
                        >
                            <RefreshCcw size={14} className="text-primary" />
                        </button>
                        <div className="ml-2 pl-2 border-l border-white/10 flex gap-2">
                            <BitsoIntegration />
                            <IbkrIntegration />
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 text-right">
                    <div className="flex flex-col items-end">
                        <p className="text-sm text-muted-foreground">Inversión Total (USD)</p>
                        <p className="text-lg font-semibold text-muted-foreground/80">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalInvested)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            ≈ {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalInvestedMXN)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Valor Actual (USD)</p>
                        <div className="flex flex-col items-end">
                            <p className="text-2xl font-bold text-primary">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPortfolioValueUSD)}
                            </p>
                            <div className={clsx("flex items-center gap-1 text-xs font-bold", totalReturnUSD >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                {totalReturnUSD >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalReturnUSD)}</span>
                                <span>({totalReturnPercent.toFixed(2)}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content - 2 Columns */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Crypto Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-semibold text-orange-400">Criptoactivos</h3>
                            <span className="font-bold text-lg">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCryptoValueUSD)}
                            </span>
                        </div>
                        <GlassCard delay={0.1} className="overflow-hidden">
                            <div className="mt-2">
                                <AssetList
                                    assets={cryptoAssets}
                                    globalTotalUSD={totalPortfolioValueUSD}
                                    onRemove={(id) => handleRemoveAsset(id.replace('agg-', ''))}
                                    onUpdate={(id, updates) => handleUpdateAsset(id.replace('agg-', ''), updates)}
                                />
                            </div>
                        </GlassCard>
                    </div>

                    {/* Stocks Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-semibold text-blue-400">Acciones y Empresas</h3>
                            <span className="font-bold text-lg">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalStocksValueUSD)}
                            </span>
                        </div>
                        <GlassCard delay={0.2} className="overflow-hidden">
                            <div className="mt-2">
                                <AssetList
                                    assets={stockAssets}
                                    globalTotalUSD={totalPortfolioValueUSD}
                                    onRemove={(id) => handleRemoveAsset(id.replace('agg-', ''))}
                                    onUpdate={(id, updates) => handleUpdateAsset(id.replace('agg-', ''), updates)}
                                />
                            </div>
                        </GlassCard>
                    </div>

                </div>

                {/* Sidebar - 1 Column */}
                <div className="space-y-6">
                    <GlassCard delay={0.3} className="min-h-[400px]">
                        <h3 className="text-lg font-semibold mb-4">Asignación de Activos</h3>
                        <div className="h-[350px]">
                            <AllocationChart assets={allAggregatedAssets} />
                        </div>
                    </GlassCard>

                    <GlassCard delay={0.4}>
                        <h3 className="font-semibold mb-4">Estadísticas</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center p-2 rounded bg-white/5">
                                <span className="text-muted-foreground">Total Activos (Lotes)</span>
                                <span className="font-bold">{assets.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded bg-white/5">
                                <span className="text-muted-foreground">Activos Únicos</span>
                                <span className="font-bold">{allAggregatedAssets.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded bg-white/5">
                                <span className="text-muted-foreground">Mejor Rendimiento</span>
                                <span className="font-bold text-emerald-400">
                                    {allAggregatedAssets.length > 0 ? allAggregatedAssets.reduce((prev, current) => {
                                        const prevReturn = prev.avgBuyPrice > 0 ? (prev.currentPrice / prev.avgBuyPrice) : 0;
                                        const curReturn = current.avgBuyPrice > 0 ? (current.currentPrice / current.avgBuyPrice) : 0;
                                        return prevReturn > curReturn ? prev : current;
                                    }).symbol : '-'}
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
