import { AssetForm } from '../components/AssetForm';
import { AssetList } from '../components/AssetList';
import { AllocationChart } from '../components/AllocationChart';
import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from '../components/ui/GlassCard';
import { useMarketData } from '../hooks/useMarketData';
import { RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

export function Portfolio() {
    const { assets, removeAsset, updateAsset } = useFinanceStore();
    const { refreshPrices, isLoading, lastUpdated } = useMarketData();

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

    const totalCryptoValue = cryptoAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
    const totalStocksValue = stockAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);

    // Total Market Value
    const totalPortfolioValue = totalCryptoValue + totalStocksValue;

    // Total Cost Basis (Invested)
    const totalInvested = assets.reduce((sum, a) => sum + (a.quantity * a.avgBuyPrice), 0);

    // Total Return
    const totalReturn = totalPortfolioValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    const handleRemoveAsset = (symbol: string) => {
        // Remove all assets defined by this symbol
        const assetsToRemove = assets.filter(a => a.symbol === symbol);
        assetsToRemove.forEach(a => removeAsset(a.id));
    };

    const handleUpdateAsset = (symbol: string, updates: any) => {
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
                    </div>
                </div>

                <div className="flex gap-6 text-right">
                    <div>
                        <p className="text-sm text-muted-foreground">Inversión Total</p>
                        <p className="text-lg font-semibold text-muted-foreground/80">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalInvested)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Valor Actual</p>
                        <div className="flex flex-col items-end">
                            <p className="text-2xl font-bold text-primary">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalPortfolioValue)}
                            </p>
                            <div className={clsx("flex items-center gap-1 text-xs font-bold", totalReturn >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                {totalReturn >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalReturn)}</span>
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
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalCryptoValue)}
                            </span>
                        </div>
                        <GlassCard delay={0.1}>
                            <p className="text-sm text-muted-foreground mb-4">Agrega activos como BTC, ETH, XRP, RENDER, LINK, SOL</p>
                            <AssetForm type="crypto" />
                            <div className="mt-6">
                                <AssetList
                                    assets={cryptoAssets}
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
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalStocksValue)}
                            </span>
                        </div>
                        <GlassCard delay={0.2}>
                            <p className="text-sm text-muted-foreground mb-4">Agrega activos como URA, PLTR, TSLA, SP500</p>
                            <AssetForm type="stock" />
                            <div className="mt-6">
                                <AssetList
                                    assets={stockAssets}
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
