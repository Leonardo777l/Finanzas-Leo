import React from 'react';
import { Trash, ChevronDown, TrendingUp } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import type { Asset } from '../types';

interface AssetListProps {
    assets: Asset[];
    onRemove?: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<Asset>) => void;
}

export function AssetList({ assets, onRemove, onUpdate }: AssetListProps) {
    const { removeAsset, updateAsset } = useFinanceStore();
    const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const handleUpdatePrice = (id: string, currentPrice: number) => {
        const newPrice = prompt('Ingresa el nuevo precio actual:', currentPrice.toString());
        if (newPrice && !isNaN(parseFloat(newPrice))) {
            const price = parseFloat(newPrice);
            if (onUpdate) {
                onUpdate(id, { currentPrice: price });
            } else {
                updateAsset(id, { currentPrice: price });
            }
        }
    };

    const handleRemove = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este activo?')) {
            if (onRemove) {
                onRemove(id);
            } else {
                removeAsset(id);
            }
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
            <div className="grid grid-cols-12 text-xs text-muted-foreground px-3 mb-2 font-medium tracking-wider">
                <div className="col-span-4">ACTIVO</div>
                <div className="col-span-3 text-right">PRECIO</div>
                <div className="col-span-3 text-right">VALOR</div>
                <div className="col-span-2 text-right">P/L</div>
            </div>

            {assets.map((asset) => {
                const isExpanded = expandedIds.has(asset.id);
                const currentValue = asset.quantity * asset.currentPrice;
                const costBasis = asset.quantity * asset.avgBuyPrice;
                const profitLoss = currentValue - costBasis;
                const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;
                const hasSubAssets = (asset as any).subAssets && (asset as any).subAssets.length > 0;

                return (
                    <div key={asset.id} className="space-y-1">
                        {/* Main Row */}
                        <div
                            className={`grid grid-cols-12 items-center p-3 rounded-xl transition-all cursor-pointer ${isExpanded ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
                                }`}
                            onClick={() => hasSubAssets && toggleExpand(asset.id)}
                        >
                            <div className="col-span-4 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${profitLoss >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {isExpanded ? <ChevronDown size={18} /> : <TrendingUp size={18} />}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{asset.symbol}</div>
                                    <div className="text-xs text-muted-foreground">{asset.quantity.toLocaleString('es-MX')} un.</div>
                                </div>
                            </div>

                            <div className="col-span-3 text-right">
                                <div className="text-sm font-medium">
                                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(asset.currentPrice)}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdatePrice(asset.id, asset.currentPrice);
                                    }}
                                    className="text-[10px] text-primary hover:text-primary/80 transition-colors"
                                >
                                    Actualizar
                                </button>
                            </div>

                            <div className="col-span-3 text-right font-medium">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(currentValue)}
                            </div>

                            <div className={`col-span-2 text-right text-xs font-medium ${profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                <div>{profitLoss >= 0 ? '+' : ''}{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(profitLoss)}</div>
                                <div>{profitLossPercent.toFixed(2)}%</div>
                            </div>
                        </div>

                        {/* Expanded Sub-Assets (Lots) */}
                        {isExpanded && hasSubAssets && (
                            <div className="pl-4 pr-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                {(asset as any).subAssets.map((subAsset: Asset, index: number) => {
                                    // const subValue = subAsset.quantity * subAsset.currentPrice; // Unused
                                    // const subCost = subAsset.quantity * subAsset.avgBuyPrice; // Unused
                                    // const subPL = subValue - subCost; // Unused

                                    return (
                                        <div key={subAsset.id || index} className="grid grid-cols-12 items-center p-2 rounded-lg bg-black/20 text-sm hover:bg-black/30 transition-colors group">
                                            <div className="col-span-4 pl-12 text-muted-foreground flex items-center gap-2">
                                                <span className="text-xs">Lote {index + 1}</span>
                                            </div>
                                            <div className="col-span-3 text-right text-muted-foreground text-xs">
                                                Buy: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(subAsset.avgBuyPrice)}
                                            </div>
                                            <div className="col-span-3 text-right text-xs text-muted-foreground">
                                                Qty: {subAsset.quantity}
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemove(subAsset.id);
                                                    }}
                                                    className="p-1 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                                    title="Eliminar este lote"
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
