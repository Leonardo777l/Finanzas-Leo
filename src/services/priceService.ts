
// Map of common symbols to CoinGecko IDs
const COINGECKO_MAP: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'LINK': 'chainlink',
    'LTC': 'litecoin',
    'BCH': 'bitcoin-cash',
    'XLM': 'stellar',
    'ALGO': 'algorand',
    'ATOM': 'cosmos',
    'XMR': 'monero',
    'EOS': 'eos',
    'TRX': 'tron',
    'XTZ': 'tezos',
    'NEO': 'neo',
    'VET': 'vechain',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'DAI': 'dai',
    'RENDER': 'render-token',
    'RNDR': 'render-token',
};

interface PriceData {
    [key: string]: {
        mxn: number;
    };
}

export const fetchCryptoPrices = async (symbols: string[]): Promise<Record<string, number>> => {
    // 1. Map symbols to IDs
    const currentMap: Record<string, string> = {};
    const idsToFetch = new Set<string>();

    symbols.forEach(sym => {
        const normalized = sym.toUpperCase();
        if (COINGECKO_MAP[normalized]) {
            const id = COINGECKO_MAP[normalized];
            currentMap[id] = normalized; // Store reverse map to return symbols
            idsToFetch.add(id);
        }
    });

    if (idsToFetch.size === 0) return {};

    try {
        const ids = Array.from(idsToFetch).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=mxn`);

        if (!response.ok) {
            throw new Error('Failed to fetch prices');
        }

        const data: PriceData = await response.json();
        const result: Record<string, number> = {};

        // 2. Map back to symbols
        Object.keys(data).forEach(id => {
            const symbol = currentMap[id];
            if (symbol && data[id].mxn) {
                result[symbol] = data[id].mxn;
            }
        });

        return result;

    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        return {};
    }
};

// Placeholder for stocks - specialized APIs usually require keys
// For now, we'll return empty so the UI relies on manual entry or existing values
export const fetchStockPrices = async (symbols: string[]): Promise<Record<string, number>> => {
    return {};
};
