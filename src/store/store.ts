// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from './portfolioSlice';

export const store = configureStore({
    reducer: {
        portfolio: portfolioReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
    try {
        const state = store.getState();
        localStorage.setItem('portfolio', JSON.stringify(state.portfolio));
    } catch (e) {
        console.error('Error saving to storage:', e);
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;