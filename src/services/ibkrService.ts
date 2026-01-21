import type { Asset } from '../types';
import { XMLParser } from 'fast-xml-parser';

interface IbkrConfig {
    token: string;
    queryId: string;
}

const PROXY_URL = '/api/ibkr';

export async function fetchIbkrPortfolio(config: IbkrConfig): Promise<Omit<Asset, 'id'>[]> {
    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Proxy error: ${response.status}`);
        }

        const textData = await response.text();

        // Parse XML
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "",
        });
        const result = parser.parse(textData);

        // Navigate to OpenPositions
        // Structure: FlexQueryResponse -> FlexStatements -> FlexStatement -> OpenPositions -> OpenPosition
        // It might be an array or single object depending on count

        const flexStatement = result?.FlexQueryResponse?.FlexStatements?.FlexStatement;

        if (!flexStatement) {
            // It might be empty or error
            if (result?.FlexQueryResponse?.ErrorMessage) {
                throw new Error(result.FlexQueryResponse.ErrorMessage);
            }
            // If completely empty, just return empty
            return [];
        }

        const positions = flexStatement.OpenPositions?.OpenPosition;

        if (!positions) {
            // Empty portfolio
            return [];
        }

        const positionList = Array.isArray(positions) ? positions : [positions];

        return positionList.map((pos: any) => {
            // Map IBKR fields to our Asset type
            // Fields depend on what user selected in Flex Query.
            // We expect: symbol, position, costBasisPrice (or costBasisMoney), markPrice, levelOfDetail

            return {
                symbol: pos.symbol,
                name: pos.description || pos.symbol,
                type: 'stock' as const,
                quantity: parseFloat(pos.position || '0'),
                avgBuyPrice: parseFloat(pos.costBasisPrice || '0'),
                currentPrice: parseFloat(pos.markPrice || '0'),
            } as Omit<Asset, 'id'>;
        }).filter((asset) => asset.quantity !== 0);

    } catch (error) {
        console.error('Error fetching IBKR portfolio:', error);
        throw error;
    }
}
