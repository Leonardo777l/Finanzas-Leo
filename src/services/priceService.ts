
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
    'MANA': 'decentraland',
    'SAND': 'the-sandbox',
    'GALA': 'gala',
    'AXS': 'axie-infinity',
    'CHZ': 'chiliz',
    'BAT': 'basic-attention-token',
    'ENJ': 'enjincoin',
    'QNT': 'quant-network',
    'APE': 'apecoin',
    'CRV': 'curve-dao-token',
    'LRC': 'loopring',
    'DYDX': 'dydx',
    'SNX': 'havven',
    'COMP': 'compound-governance-token',
    'YFI': 'yearn-finance',
    'MKR': 'maker',
    'AAVE': 'aave',
    'UNI': 'uniswap',
    'SUSHI': 'sushi',
    'GRT': 'the-graph',
    'FTM': 'fantom',
    'SHIB': 'shiba-inu',
};

interface PriceResponse {
    [key: string]: {
        mxn: number;
        usd: number;
    };
}

export const fetchCryptoPrices = async (symbols: string[]): Promise<Record<string, { mxn: number, usd: number }>> => {
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
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=mxn,usd`);

        if (!response.ok) {
            throw new Error('Failed to fetch prices');
        }

        const data: PriceResponse = await response.json();
        const result: Record<string, { mxn: number, usd: number }> = {};

        // 2. Map back to symbols
        Object.keys(data).forEach(id => {
            const symbol = currentMap[id];
            if (symbol) {
                result[symbol] = {
                    mxn: data[id].mxn || 0,
                    usd: data[id].usd || 0
                };
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
export const fetchStockPrices = async (_symbols: string[]): Promise<Record<string, { mxn: number, usd: number }>> => {
    return {};
};
