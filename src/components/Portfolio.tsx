// src/components/Portfolio.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { addTokens, removeToken, updateHoldings, updatePrices } from '../store/portfolioSlice';
import { fetchMarketData } from '../utils/api';
import DonutChart from './DonutChart';
import Sparkline from './Sparkline';
import AddTokenModal from './AddTokenModal';
import type { Token } from '../types';
import { RefreshCw, Plus, MoreVertical } from 'lucide-react';

const Portfolio: React.FC = () => {
    const dispatch = useDispatch();
    const { tokens, lastUpdated } = useSelector((state: RootState) => state.portfolio);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const itemsPerPage = 10;

    useEffect(() => {
        if (tokens.length > 0) {
            refreshPrices();
        }
    }, []);

    const refreshPrices = async () => {
        if (tokens.length === 0) return;

        setIsRefreshing(true);
        try {
            const ids = tokens.map(t => t.id);
            const data = await fetchMarketData(ids);
            dispatch(updatePrices(data));
        } catch (e) {
            console.error('Error refreshing prices:', e);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleAddTokens = (newTokens: Token[]) => {
        dispatch(addTokens(newTokens));
    };

    const handleEditHoldings = (id: string, currentHoldings?: number) => {
        setEditingId(id);
        setEditValue(currentHoldings?.toString() || '0');
        setMenuOpen(null);
    };

    const saveHoldings = (id: string) => {
        const value = parseFloat(editValue) || 0;
        dispatch(updateHoldings({ id, holdings: value }));
        setEditingId(null);
    };

    const handleRemove = (id: string) => {
        dispatch(removeToken(id));
        setMenuOpen(null);
    };

    const totalValue = tokens.reduce(
        (sum, t) => sum + (t.holdings || 0) * (t.current_price || 0),
        0
    );

    const paginatedTokens = tokens.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(tokens.length / itemsPerPage);

    const formatTime = (isoString: string | null): string => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const colors = [
        '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
        '#3b82f6', '#ef4444', '#6366f1', '#14b8a6'
    ];

    const tokensWithPercentage = tokens
        .map((token, i) => {
            const value = (token.holdings || 0) * (token.current_price || 0);
            const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
            return {
                ...token,
                value,
                percentage,
                color: colors[i % colors.length]
            };
        })
        .filter(t => t.value > 0)
        .sort((a, b) => b.value - a.value);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'hsla(240, 8%, 14%, 1)' }}>
            <div className="mx-auto px-2 md:px-4">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white"></h1>
                </header>

                {/* Portfolio Overview Card */}
                <div
                    className="rounded-2xl p-6 shadow-sm mb-8"
                    style={{ backgroundColor: 'hsla(240, 7%, 16%, 1)' }}
                >
                    {/* ✅ Responsive wrapper for top card */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Left: Portfolio Total */}
                        <div className="flex flex-col h-auto md:h-[240px] w-full md:w-[658px] justify-start relative">
                            <div>
                                <h2 className="text-xl text-gray-400 mb-1">Portfolio Total</h2>
                                <div className="text-5xl md:text-5xl font-bold text-white my-4 md:my-6">
                                    ${totalValue.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </div>
                            </div>

                            {lastUpdated && (
                                <div className="md:absolute bottom-0 text-base text-gray-500">
                                    Last updated: {formatTime(lastUpdated)}
                                </div>
                            )}
                        </div>

                        {/* Middle: Donut Chart */}
                        <div className="w-full md:w-[10%] flex items-center justify-center">
                            <DonutChart tokens={tokens} />
                        </div>

                        {/* Right: Token Legend */}
                        <div className="flex-1 w-full md:w-auto space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            {tokensWithPercentage.length === 0 ? (
                                <div className="text-center text-gray-500 py-4">
                                    <p className="text-sm">No tokens with holdings</p>
                                </div>
                            ) : (
                                tokensWithPercentage.map((token) => (
                                    <div key={token.id} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {/* Removed the colored dot */}
                                            <img
                                                src={token.image}
                                                alt={token.name}
                                                className="w-5 h-5 rounded-full flex-shrink-0"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"%3E%3Crect width="20" height="20" fill="%2326262b"/%3E%3C/svg%3E';
                                                }}
                                            />
                                            {/* Apply token.color to the token name */}
                                            <span className="text-sm font-medium truncate" style={{ color: token.color }}>
                                                {token.name} ({token.symbol.toUpperCase()})
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-300 flex-shrink-0">
                                            {token.percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>

                {/* Watchlist Table */}
                <div
                    className="rounded-2xl shadow-sm overflow-hidden"
                    style={{ backgroundColor: 'hsla(240, 7%, 16%, 1)' }}
                >
                    <div className="p-4 md:p-6 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-lime-500 text-2xl">★</span>
                            Watchlist
                        </h2>

                        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <button
                                onClick={refreshPrices}
                                disabled={isRefreshing || tokens.length === 0}
                                className="px-3 md:px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors text-gray-300 w-full sm:w-auto justify-center"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span className="sm:inline hidden">Refresh Prices</span>
                                <span className="sm:hidden inline">Refresh</span>
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-3 md:px-4 py-2 bg-lime-500 text-black rounded-lg hover:bg-lime-600 flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Token</span>
                            </button>
                        </div>
                    </div>

                    {/* ✅ Table responsive scroll */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm md:text-base">
                            <thead className="border-b border-gray-700">
                                <tr>
                                    {['Token', 'Price', '24h %', 'Sparkline (7d)', 'Holdings', 'Value', ''].map((label, i) => (
                                        <th
                                            key={i}
                                            className={`px-4 md:px-6 py-3 text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider ${i === 0
                                                ? 'text-left'
                                                : i === 3
                                                    ? 'text-center hidden lg:table-cell'
                                                    : 'text-right'
                                                }`}
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {/* (body left untouched, no logic change) */}
                                {paginatedTokens.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="text-gray-600">
                                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                </div>
                                                <p className="text-lg text-white">No tokens in watchlist</p>
                                                <p className="text-sm text-gray-500">Click "Add Token" to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTokens.map((token) => {
                                        const isPositive = token.price_change_percentage_24h >= 0;
                                        const value = (token.holdings || 0) * token.current_price;

                                        return (
                                            <tr key={token.id} className="hover:bg-gray-800 transition-colors">
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <img
                                                            src={token.image}
                                                            alt={token.name}
                                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src =
                                                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%2326262b"/%3E%3C/svg%3E';
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="font-medium text-white truncate">{token.name}</div>
                                                            <div className="text-xs md:text-sm text-gray-500 uppercase">{token.symbol}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right font-medium text-white">
                                                    ${token.current_price.toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 6
                                                    })}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                                                    <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                        {isPositive ? '+' : ''}{token.price_change_percentage_24h.toFixed(2)}%
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center hidden lg:table-cell">
                                                    <Sparkline
                                                        data={token.sparkline_in_7d?.price || []}
                                                        color={isPositive ? '#10b981' : '#ef4444'}
                                                    />
                                                </td>
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                                                    {editingId === token.id ? (
                                                        <input
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onBlur={() => saveHoldings(token.id)}
                                                            onKeyPress={(e) => e.key === 'Enter' && saveHoldings(token.id)}
                                                            className="w-20 md:w-24 px-2 py-1 border border-purple-500 rounded text-right focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900 text-white"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEditHoldings(token.id, token.holdings)}
                                                            className="text-white hover:text-purple-400 transition-colors"
                                                        >
                                                            {token.holdings || 0}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right font-medium text-white">
                                                    ${value.toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right relative">
                                                    <button
                                                        onClick={() => setMenuOpen(menuOpen === token.id ? null : token.id)}
                                                        className="text-gray-500 hover:text-gray-300 transition-colors"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                    {menuOpen === token.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setMenuOpen(null)}
                                                            />
                                                            <div className="absolute right-0 mt-2 w-40 md:w-48 rounded-lg shadow-lg border border-gray-700 z-20 bg-gray-800">
                                                                <button
                                                                    onClick={() => handleRemove(token.id)}
                                                                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-700 rounded-lg transition-colors"
                                                                >
                                                                    Remove from watchlist
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {tokens.length > itemsPerPage && (
                        <div className="p-4 md:p-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-xs md:text-sm text-gray-500 text-center sm:text-left">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, tokens.length)} of {tokens.length} tokens
                            </div>
                            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 md:px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-300"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 md:px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Token Modal */}
            {showAddModal && (
                <AddTokenModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddTokens}
                />
            )}
        </div>
    );
};

export default Portfolio;
