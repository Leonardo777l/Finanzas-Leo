import { Trash } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import type { Asset } from '../types';

interface AssetListProps {
    assets: Asset[];
}

export function AssetList({ assets }: AssetListProps) {
    const { removeAsset, updateAsset } = useFinanceStore();

    const handleUpdatePrice = (id: string) => {
        const newPrice = prompt('Ingresa el nuevo precio actual:');
        if (newPrice && !isNaN(parseFloat(newPrice))) {
            updateAsset(id, { currentPrice: parseFloat(newPrice) });
        }
    };

    if (assets.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground text-sm">
                No hay activos registrados
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-12 text-xs text-muted-foreground px-3 mb-2">
                <div className="col-span-3">ACTIVO</div>
                <div className="col-span-3 text-right">PRECIO</div>
                <div className="col-span-3 text-right">VALOR</div>
                <div className="col-span-2 text-right">P/L</div>
                <div className="col-span-1"></div>
            </div>

            {assets.map((asset) => {
                const currentValue = asset.quantity * asset.currentPrice;
                const costBasis = asset.quantity * asset.avgBuyPrice;
                const profitLoss = currentValue - costBasis;
                const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

                return (
                    <div
                        key={asset.id}
                        className="grid grid-cols-12 items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                        <div className="col-span-3 font-medium">
                            {asset.symbol}
                            <div className="text-xs text-muted-foreground">{asset.quantity} un.</div>
                        </div>

                        <div className="col-span-3 text-right">
                            <div className="text-sm">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(asset.currentPrice)}</div>
                            <button
                                onClick={() => handleUpdatePrice(asset.id)}
                                className="text-[10px] text-primary hover:underline"
                            >
                                Actualizar
                            </button>
                        </div>

                        <div className="col-span-3 text-right font-medium">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(currentValue)}
                        </div>

                        <div className={`col-span-2 text-right text-xs font-medium ${profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <div>{profitLoss >= 0 ? '+' : ''}{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(profitLoss)}</div>
                            <div>{profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%</div>
                        </div>

                        <div className="col-span-1 flex justify-end">
                            <button
                                onClick={() => removeAsset(asset.id)}
                                className="text-muted-foreground hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
