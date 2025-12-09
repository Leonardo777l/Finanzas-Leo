import { AssetForm } from '../components/AssetForm';
import { AssetList } from '../components/AssetList';
import { AllocationChart } from '../components/AllocationChart';
import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from '../components/ui/GlassCard';

export function Portfolio() {
    const assets = useFinanceStore((state) => state.assets);

    const cryptoAssets = assets.filter(a => a.type === 'crypto');
    const stockAssets = assets.filter(a => a.type === 'stock');

    const totalCrypto = cryptoAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
    const totalStocks = stockAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
    const totalPortfolio = totalCrypto + totalStocks;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Portafolio de Inversión
                </h2>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalPortfolio)}
                    </p>
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
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalCrypto)}
                            </span>
                        </div>
                        <GlassCard delay={0.1}>
                            <p className="text-sm text-muted-foreground mb-4">Agrega activos como BTC, ETH, XRP, RENDER, LINK, SOL</p>
                            <AssetForm type="crypto" />
                            <div className="mt-6">
                                <AssetList assets={cryptoAssets} />
                            </div>
                        </GlassCard>
                    </div>

                    {/* Stocks Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-semibold text-blue-400">Acciones y Empresas</h3>
                            <span className="font-bold text-lg">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalStocks)}
                            </span>
                        </div>
                        <GlassCard delay={0.2}>
                            <p className="text-sm text-muted-foreground mb-4">Agrega activos como URA, PLTR, TSLA, SP500</p>
                            <AssetForm type="stock" />
                            <div className="mt-6">
                                <AssetList assets={stockAssets} />
                            </div>
                        </GlassCard>
                    </div>

                </div>

                {/* Sidebar - 1 Column */}
                <div className="space-y-6">
                    <GlassCard delay={0.3} className="min-h-[400px]">
                        <h3 className="text-lg font-semibold mb-4">Asignación de Activos</h3>
                        <div className="h-[350px]">
                            <AllocationChart assets={assets} />
                        </div>
                    </GlassCard>

                    <GlassCard delay={0.4}>
                        <h3 className="font-semibold mb-4">Estadísticas</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center p-2 rounded bg-white/5">
                                <span className="text-muted-foreground">Total Activos</span>
                                <span className="font-bold">{assets.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded bg-white/5">
                                <span className="text-muted-foreground">Mejor Rendimiento</span>
                                <span className="font-bold text-emerald-400">
                                    {assets.length > 0 ? assets.reduce((prev, current) => (prev.currentPrice / prev.avgBuyPrice > current.currentPrice / current.avgBuyPrice) ? prev : current).symbol : '-'}
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
