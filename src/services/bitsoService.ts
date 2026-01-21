import CryptoJS from 'crypto-js';

const BITSO_BASE_URL = 'https://api.bitso.com/v3';

export interface BitsoBalance {
    currency: string;
    total: string;
    locked: string;
    available: string;
}

interface BitsoResponse {
    success: boolean;
    payload: {
        balances: BitsoBalance[];
    };
    error?: {
        message: string;
        code: string;
    }
}

export async function fetchBitsoBalances(apiKey: string, apiSecret: string): Promise<BitsoBalance[]> {
    const nonce = new Date().getTime();
    const method = 'GET';
    const requestPath = '/v3/balance/';
    const body = '';

    // Signature: Nonce + Method + Path + JSON Payload (if any)
    const dataToSign = nonce + method + requestPath + body;
    const signature = CryptoJS.HmacSHA256(dataToSign, apiSecret).toString(CryptoJS.enc.Hex);

    const authHeader = `Bitso ${apiKey}:${nonce}:${signature}`;

    try {
        const response = await fetch(`${BITSO_BASE_URL}${requestPath}`, {
            method: method,
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Bitso API request failed: ${response.status} ${text}`);
        }

        const data: BitsoResponse = await response.json();

        if (!data.success) {
            throw new Error(data.error?.message || 'Unknown Bitso error');
        }

        // Filter out zero balances
        return data.payload.balances.filter(b => parseFloat(b.total) > 0);
    } catch (error) {
        console.error('Error fetching Bitso balances:', error);
        throw error;
    }
}
