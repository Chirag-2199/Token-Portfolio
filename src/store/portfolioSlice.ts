// src/store/portfolioSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Token, PortfolioState, UpdateHoldingsPayload } from '../types';

const initialState: PortfolioState = {
    tokens: [],
    lastUpdated: null,
};

// Load from localStorage
const loadFromStorage = (): PortfolioState => {
    try {
        const saved = localStorage.getItem('portfolio');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading from storage:', e);
    }
    return initialState;
};

const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState: loadFromStorage(),
    reducers: {
        setTokens: (state, action: PayloadAction<Token[]>) => {
            state.tokens = action.payload;
            state.lastUpdated = new Date().toISOString();
        },

        addTokens: (state, action: PayloadAction<Token[]>) => {
            const newTokens = action.payload.filter(
                newToken => !state.tokens.some(t => t.id === newToken.id)
            );
            state.tokens = [...state.tokens, ...newTokens];
            state.lastUpdated = new Date().toISOString();
        },

        removeToken: (state, action: PayloadAction<string>) => {
            state.tokens = state.tokens.filter(t => t.id !== action.payload);
            state.lastUpdated = new Date().toISOString();
        },

        updateHoldings: (state, action: PayloadAction<UpdateHoldingsPayload>) => {
            const { id, holdings } = action.payload;
            const token = state.tokens.find(t => t.id === id);
            if (token) {
                token.holdings = holdings;
            }
            state.lastUpdated = new Date().toISOString();
        },

        updatePrices: (state, action: PayloadAction<Token[]>) => {
            action.payload.forEach(update => {
                const token = state.tokens.find(t => t.id === update.id);
                if (token) {
                    token.current_price = update.current_price;
                    token.price_change_percentage_24h = update.price_change_percentage_24h;
                    token.sparkline_in_7d = update.sparkline_in_7d;
                }
            });
            state.lastUpdated = new Date().toISOString();
        },
    },
});

export const {
    setTokens,
    addTokens,
    removeToken,
    updateHoldings,
    updatePrices
} = portfolioSlice.actions;

export default portfolioSlice.reducer;