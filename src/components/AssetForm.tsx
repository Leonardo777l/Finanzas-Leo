import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { fetchCryptoPrices } from '../services/priceService';

interface AssetFormProps {
    type: 'crypto' | 'stock';
}

export function AssetForm({ type }: AssetFormProps) {
    const addAsset = useFinanceStore((state) => state.addAsset);
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol || !quantity) return;

        const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        if (type === 'crypto') {
            setIsFetching(true);
            try {
                // quantity input acts as MXN investment for crypto
                const mxnAmount = Number(quantity);
                const prices = await fetchCryptoPrices([cleanSymbol]);
                const tickerData = prices[cleanSymbol];

                if (!tickerData || !tickerData.mxn) {
                    alert(`No se encontró el precio en vivo para ${cleanSymbol}.`);
                    setIsFetching(false);
                    return;
                }

                const currentPriceMxn = tickerData.mxn;
                const calculatedCryptoQuantity = mxnAmount / currentPriceMxn;

                addAsset({
                    symbol: cleanSymbol,
                    name: cleanSymbol,
                    type,
                    quantity: calculatedCryptoQuantity,
                    avgBuyPrice: currentPriceMxn,
                    currentPrice: currentPriceMxn,
                    currentPriceUSD: tickerData.usd || undefined,
                });

                setSymbol('');
                setQuantity('');
            } catch (error) {
                console.error("Error al obtener precio de crypto:", error);
                alert("Error al obtener precio en vivo.");
            } finally {
                setIsFetching(false);
            }
        } else {
            if (!price) return;
            addAsset({
                symbol: cleanSymbol,
                name: cleanSymbol,
                type,
                quantity: Number(quantity),
                avgBuyPrice: Number(price),
                currentPrice: Number(price),
            });
            setSymbol('');
            setQuantity('');
            setPrice('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Símbolo</label>
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder={type === 'crypto' ? 'BTC' : 'AAPL'}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm uppercase"
                />
            </div>

            <div className="w-24 md:w-32 space-y-1">
                <label className="text-xs text-muted-foreground ml-1">
                    {type === 'crypto' ? 'Inversión (MXN)' : 'Cantidad'}
                </label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
            </div>

            {type === 'stock' && (
                <div className="w-32 space-y-1">
                    <label className="text-xs text-muted-foreground ml-1">Precio Compra</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={isFetching}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white p-2 rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
                {isFetching ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            </button>
        </form>
    );
}
