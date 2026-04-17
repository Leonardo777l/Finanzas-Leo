import React, { useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Loader2, Star, RefreshCw } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { fetchCryptoPrices } from '../services/priceService';
import type { Asset } from '../types';
import { clsx } from 'clsx';

interface AssetListProps {
    assets: Asset[];
    globalTotalUSD?: number;
    onRemove?: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<Asset>) => void;
}

export function AssetList({ assets, globalTotalUSD = 0 }: AssetListProps) {
    const { addAsset } = useFinanceStore();
    const [actionRow, setActionRow] = useState<{ id: string, type: 'deposit' | 'withdraw' } | null>(null);
    const [amount, setAmount] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    const handleActionSubmit = async (e: React.FormEvent, asset: Asset, actionType: 'deposit' | 'withdraw') => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

        setIsFetching(true);
        try {
            const mxnAmount = Number(amount);
            
            // Re-fetch live price via priceService
            let prices;
            if (asset.type === 'crypto') {
                 prices = await fetchCryptoPrices([asset.symbol]);
            } else {
                 alert('Operación no soportada para acciones todavía.');
                 setIsFetching(false);
                 return;
            }
            
            const tickerData = prices[asset.symbol];

            if (!tickerData || !tickerData.mxn) {
                alert(`No se encontró el precio en vivo para ${asset.symbol}.`);
                setIsFetching(false);
                return;
            }

            const currentPriceMxn = tickerData.mxn;
            const currentPriceUsd = tickerData.usd;
            const calculatedQty = mxnAmount / currentPriceMxn; // fraction of coin

            if (actionType === 'deposit') {
                addAsset({
                    symbol: asset.symbol,
                    name: asset.name,
                    type: asset.type,
                    quantity: calculatedQty,
                    avgBuyPrice: currentPriceMxn,
                    currentPrice: currentPriceMxn,
                    currentPriceUSD: currentPriceUsd,
                });
            } else {
                // Withdraw (negative quantity lot)
                if (calculatedQty > asset.quantity) {
                    alert('Saldo insuficiente para retirar esa cantidad.');
                    setIsFetching(false);
                    return;
                }
                
                addAsset({
                    symbol: asset.symbol,
                    name: asset.name,
                    type: asset.type,
                    quantity: -Math.abs(calculatedQty),
                    avgBuyPrice: asset.avgBuyPrice, // Withdraw at average cost basis mathematically
                    currentPrice: currentPriceMxn,
                    currentPriceUSD: currentPriceUsd,
                });
            }

            setAmount('');
            setActionRow(null);
            
        } catch (error) {
            console.error("Error actions asset:", error);
            alert("Error al procesar la operación.");
        } finally {
            setIsFetching(false);
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
        <div className="w-full overflow-x-auto pb-4">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase border-b border-white/10">
                    <tr>
                        <th className="px-4 py-3 font-medium">Currency</th>
                        <th className="px-4 py-3 font-medium min-w-[120px]">% in wallet</th>
                        <th className="px-4 py-3 font-medium">Price</th>
                        <th className="px-4 py-3 font-medium">Total balance</th>
                        <th className="px-4 py-3 font-medium">Available balance</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {assets.map((asset) => {
                        const isActionOpen = actionRow?.id === asset.id;
                        const usdValue = asset.quantity * (asset.currentPriceUSD || 0);
                        const allocationPct = globalTotalUSD > 0 ? (usdValue / globalTotalUSD) * 100 : 0;
                        const change24h = asset.priceChange24h || 0;
                        
                        return (
                            <React.Fragment key={asset.id}>
                                <tr className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Star size={14} className="text-emerald-500 fill-emerald-500" />
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-white uppercase shadow-sm border border-white/5">
                                                {asset.symbol.substring(0,4)}
                                            </div>
                                            <span className="font-semibold text-[15px]">{asset.name}</span>
                                        </div>
                                    </td>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1.5 w-24">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div 
                                                        className={clsx("h-full rounded-full", asset.type === 'crypto' ? "bg-orange-500" : "bg-blue-500")}
                                                        style={{ width: `${Math.min(allocationPct, 100)}%` }} 
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground font-medium">{allocationPct.toFixed(2)}%</span>
                                        </div>
                                    </td>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-white/90">
                                                {new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(asset.currentPriceUSD || 0)} <span className="text-muted-foreground font-normal text-xs">USD</span>
                                            </span>
                                            <span className={clsx("text-xs font-semibold flex items-center gap-0.5", change24h >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                                {change24h > 0 ? '+' : ''}{change24h.toFixed(2)}% <span className="font-normal opacity-70">24h</span>
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-white">
                                                {new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 8 }).format(asset.quantity)} <span className="text-muted-foreground font-normal text-xs">{asset.symbol}</span>
                                            </span>
                                            <span className="text-xs font-semibold text-white/60">
                                                {new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(usdValue)} <span className="font-normal opacity-70">USD</span>
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-white">
                                                {new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 8 }).format(asset.quantity)} <span className="text-muted-foreground font-normal text-xs">{asset.symbol}</span>
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-5 text-sm font-semibold">
                                            <button 
                                                onClick={() => setActionRow(isActionOpen && actionRow?.type === 'deposit' ? null : { id: asset.id, type: 'deposit' })}
                                                className="flex items-center gap-1.5 text-white hover:text-emerald-400 transition-colors"
                                            >
                                                <ArrowDownToLine size={15} /> Deposit
                                            </button>
                                            <button 
                                                className="flex items-center gap-1.5 text-white hover:text-primary transition-colors opacity-50 cursor-not-allowed"
                                                title="Trading view - Comming soon"
                                            >
                                                <RefreshCw size={15} /> Buy / Sell
                                            </button>
                                            <button 
                                                onClick={() => setActionRow(isActionOpen && actionRow?.type === 'withdraw' ? null : { id: asset.id, type: 'withdraw' })}
                                                className="flex items-center gap-1.5 text-white hover:text-rose-400 transition-colors"
                                            >
                                                <ArrowUpRight size={15} /> Send
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                
                                {isActionOpen && (
                                    <tr className="bg-black/40 shadow-inner">
                                        <td colSpan={6} className="px-5 py-5 border-y border-white/5">
                                            <form 
                                                onSubmit={(e) => handleActionSubmit(e, asset, actionRow.type)} 
                                                className={clsx(
                                                    "flex flex-col md:flex-row items-start md:items-end gap-6 pl-4 border-l-4",
                                                    actionRow.type === 'deposit' ? "border-emerald-500" : "border-rose-500"
                                                )}
                                            >
                                                <div className="flex-1 space-y-2">
                                                    <h3 className={clsx("text-lg font-bold", actionRow.type === 'deposit' ? "text-emerald-400" : "text-rose-400")}>
                                                        {actionRow.type === 'deposit' ? `Añadir (Deposit) ${asset.symbol}` : `Retirar (Send) ${asset.symbol}`}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-xl">
                                                        {actionRow.type === 'deposit' 
                                                            ? 'Ingresa el monto en pesos mexicanos (MXN) que estás depositando. Obtendremos el precio real y añadiremos la cantidad exacta de la moneda al portafolio.'
                                                            : 'Ingresa el valor monetario en MXN que retiraste de esta moneda. Descontaremos automáticamente la fracción correspondiente de tu balance total.'}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-end gap-3 shrink-0">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-semibold text-white/50 block tracking-wider uppercase">
                                                            Monto (MXN)
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                min="0.01"
                                                                value={amount}
                                                                onChange={(e) => setAmount(e.target.value)}
                                                                className="w-40 bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold transition-all focus:bg-black/50"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        disabled={isFetching || !amount}
                                                        className={clsx(
                                                            "h-[42px] px-6 rounded-xl text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center min-w-[120px]",
                                                            actionRow.type === 'deposit' ? "bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/20" : "bg-rose-600 hover:bg-rose-500 hover:shadow-rose-500/20",
                                                            (isFetching || !amount) && "opacity-50 cursor-not-allowed shadow-none"
                                                        )}
                                                    >
                                                        {isFetching ? <Loader2 className="animate-spin" size={18} /> : (actionRow.type === 'deposit' ? "Depositar" : "Retirar")}
                                                    </button>
                                                </div>
                                            </form>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
