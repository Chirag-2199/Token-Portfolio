// src/types/index.ts

export interface SparklineData {
    price: number[];
}

export interface Token {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number | null;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    roi: any | null;
    last_updated: string;
    sparkline_in_7d?: SparklineData;
    holdings?: number;
}

export interface CoinSearchResult {
    id: string;
    name: string;
    api_symbol: string;
    symbol: string;
    market_cap_rank: number | null;
    thumb: string;
    large: string;
}

export interface TrendingCoin {
    item: {
        id: string;
        coin_id: number;
        name: string;
        symbol: string;
        market_cap_rank: number;
        thumb: string;
        small: string;
        large: string;
        slug: string;
        price_btc: number;
        score: number;
    };
}

export interface SearchResponse {
    coins: CoinSearchResult[];
}

export interface TrendingResponse {
    coins: TrendingCoin[];
}

export interface PortfolioState {
    tokens: Token[];
    lastUpdated: string | null;
}

export interface UpdateHoldingsPayload {
    id: string;
    holdings: number;
}