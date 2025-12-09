import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';

interface AssetFormProps {
    type: 'crypto' | 'stock';
}

export function AssetForm({ type }: AssetFormProps) {
    const addAsset = useFinanceStore((state) => state.addAsset);
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol || !quantity || !price) return;

        addAsset({
            symbol: symbol.toUpperCase(),
            name: symbol.toUpperCase(), // Simplification
            type,
            quantity: Number(quantity),
            avgBuyPrice: Number(price),
            currentPrice: Number(price), // Initial price
        });

        setSymbol('');
        setQuantity('');
        setPrice('');
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

            <div className="w-24 space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Cantidad</label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
            </div>

            <div className="w-32 space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Precio</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
            </div>

            <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white p-2 rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
                <Plus size={20} />
            </button>
        </form>
    );
}
