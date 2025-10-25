// src/utils/api.ts
import axios from 'axios';
import type { Token, SearchResponse, TrendingResponse } from '../types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const api = axios.create({
    baseURL: COINGECKO_API,
    timeout: 10000,
});

/**
 * Fetch market data for tokens
 */
export const fetchMarketData = async (ids: string[]): Promise<Token[]> => {
    try {
        const idsString = ids.join(',');
        const response = await api.get<Token[]>('/coins/markets', {
            params: {
                vs_currency: 'usd',
                ids: idsString,
                order: 'market_cap_desc',
                sparkline: true,
                price_change_percentage: '24h',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
    }
};

/**
 * Search for tokens
 */
export const searchTokens = async (query: string): Promise<SearchResponse> => {
    try {
        const response = await api.get<SearchResponse>('/search', {
            params: { query },
        });
        return response.data;
    } catch (error) {
        console.error('Error searching tokens:', error);
        throw error;
    }
};

/**
 * Fetch trending tokens
 */
export const fetchTrending = async (): Promise<TrendingResponse> => {
    try {
        const response = await api.get<TrendingResponse>('/search/trending');
        return response.data;
    } catch (error) {
        console.error('Error fetching trending:', error);
        throw error;
    }
};

/**
 * Fetch detailed token info by IDs and initialize holdings
 */
export const fetchTokensByIds = async (ids: string[]): Promise<Token[]> => {
    try {
        const data = await fetchMarketData(ids);
        return data.map(token => ({
            ...token,
            holdings: 0,
        }));
    } catch (error) {
        console.error('Error fetching tokens by IDs:', error);
        throw error;
    }
};