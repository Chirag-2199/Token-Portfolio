// src/components/AddTokenModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { searchTokens, fetchTrending, fetchTokensByIds } from '../utils/api';
import type { Token, CoinSearchResult, TrendingCoin } from '../types';

interface AddTokenModalProps {
    onClose: () => void;
    onAdd: (tokens: Token[]) => void;
}

const AddTokenModal: React.FC<AddTokenModalProps> = ({ onClose, onAdd }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CoinSearchResult[]>([]);
    const [trending, setTrending] = useState<TrendingCoin[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadTrending();
    }, []);

    const loadTrending = async () => {
        try {
            setLoading(true);
            const data = await fetchTrending();
            setTrending(data.coins || []);
            setError(null);
        } catch (e) {
            console.error('Error loading trending:', e);
            setError('Failed to load trending tokens');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await searchTokens(searchQuery);
                setSearchResults(data.coins || []);
                setError(null);
            } catch (e) {
                console.error('Error searching:', e);
                setError('Failed to search tokens');
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const toggleSelect = (coin: CoinSearchResult | TrendingCoin) => {
        const id = 'id' in coin ? coin.id : coin.item.id;
        setSelected(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleAdd = async () => {
        if (selected.length === 0) return;
        try {
            setLoading(true);
            const tokens = await fetchTokensByIds(selected);
            onAdd(tokens);
            onClose();
        } catch (e) {
            console.error('Error adding tokens:', e);
            setError('Failed to add tokens');
            setLoading(false);
        }
    };

    const displayList: (CoinSearchResult | TrendingCoin)[] = searchQuery ? searchResults : trending;

    const getCoinData = (coin: CoinSearchResult | TrendingCoin) => {
        if ('item' in coin) {
            return {
                id: coin.item.id,
                name: coin.item.name,
                symbol: coin.item.symbol,
                thumb: coin.item.thumb,
            };
        }
        return {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            thumb: coin.thumb,
        };
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
                style={{ backgroundColor: 'hsla(240, 8%, 14%, 1)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Add Token</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-200 text-3xl leading-none w-8 h-8 flex items-center justify-center"
                        >
                            ×
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search tokens..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {loading && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
                    {!searchQuery && trending.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                Trending
                            </h3>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8 text-red-500">
                            {error}
                        </div>
                    )}

                    {!loading && !error && displayList.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            {searchQuery ? 'No tokens found' : 'No trending tokens available'}
                        </div>
                    )}

                    <div className="space-y-2">
                        {displayList.map((coin) => {
                            const { id, name, symbol, thumb } = getCoinData(coin);
                            const isSelected = selected.includes(id);

                            return (
                                <div
                                    key={id}
                                    onClick={() => toggleSelect(coin)}
                                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${isSelected
                                        ? 'bg-purple-700 border border-purple-600'
                                        : 'hover:bg-gray-800 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={thumb}
                                            alt={name}
                                            className="w-10 h-10 rounded-full"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23343434"/%3E%3C/svg%3E';
                                            }}
                                        />
                                        <div>
                                            <div className="font-medium text-white">{name}</div>
                                            <div className="text-sm text-gray-400 uppercase">{symbol}</div>
                                        </div>
                                    </div>

                                    <div
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                            ? 'border-purple-600 bg-purple-600'
                                            : 'border-gray-600'
                                            }`}
                                    >
                                        {isSelected && (
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700">
                    <button
                        onClick={handleAdd}
                        disabled={selected.length === 0 || loading}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${selected.length > 0 && !loading
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Adding...' : `Add to Watchlist (${selected.length})`}
                    </button>
                </div>
            </div>
        </div>

    );
};

export default AddTokenModal;
