
import { useState, useCallback } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { fetchCryptoPrices, fetchStockPrices } from '../services/priceService';

export function useMarketData() {
    const { assets, updateAsset } = useFinanceStore();
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const refreshPrices = useCallback(async () => {
        setIsLoading(true);
        try {
            // Filter assets by type
            const cryptoAssets = assets.filter(a => a.type === 'crypto');
            const stockAssets = assets.filter(a => a.type === 'stock');

            // Get unique symbols to fetch
            const cryptoSymbols = Array.from(new Set(cryptoAssets.map(a => a.symbol)));
            const stockSymbols = Array.from(new Set(stockAssets.map(a => a.symbol)));

            // Fetch live data
            const [cryptoPrices, stockPrices] = await Promise.all([
                fetchCryptoPrices(cryptoSymbols),
                fetchStockPrices(stockSymbols)
            ]);

            const allPrices = { ...cryptoPrices, ...stockPrices };

            // Update store
            // Note: This iterates over all assets. If we have many assets, batch update would be better in store.
            // But checking if price changed is good enough for now.
            assets.forEach(asset => {
                const newPrice = allPrices[asset.symbol];
                if (newPrice !== undefined && newPrice !== asset.currentPrice) {
                    updateAsset(asset.id, { currentPrice: newPrice });
                }
            });

            setLastUpdated(new Date());

        } catch (error) {
            console.error('Failed to refresh market data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [assets, updateAsset]);

    return {
        refreshPrices,
        isLoading,
        lastUpdated
    };
}
