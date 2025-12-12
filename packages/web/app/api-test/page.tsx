'use client';

import { useState } from 'react';
import { usePriceOracle } from '@/hooks/usePriceOracle';
import { useSideShift } from '@/hooks/useSideShift';
import { formatPrice, formatPriceChange } from '@/lib/price-oracle';
import { formatShiftStatus } from '@/lib/sideshift-api';

/**
 * API Test Page - Showcase real integrations
 * Demonstrates live data from CoinGecko and SideShift APIs
 */
export default function APITestPage() {
  const [quoteParams, setQuoteParams] = useState({
    depositCoin: 'eth',
    settleCoin: 'btc',
    depositAmount: '1',
  });
  const [quote, setQuote] = useState<any>(null);
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState<any>(null);

  const { prices, loading: pricesLoading } = usePriceOracle(['ETH', 'BTC', 'USDT', 'USDC', 'SOL', 'MATIC']);
  const { loading: shiftLoading, error: shiftError, getQuote, getShiftStatus } = useSideShift();

  const handleGetQuote = async () => {
    // Validate inputs
    if (!quoteParams.depositCoin || !quoteParams.settleCoin || !quoteParams.depositAmount) {
      alert('Please fill in all fields');
      return;
    }
    
    const result = await getQuote(
      quoteParams.depositCoin.trim().toLowerCase(),
      quoteParams.settleCoin.trim().toLowerCase(),
      quoteParams.depositAmount.trim()
    );
    setQuote(result);
  };

  const handleCheckStatus = async () => {
    if (!orderId) return;
    const result = await getShiftStatus(orderId);
    setOrderStatus(result);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">API Integration Test</h1>
          <p className="text-slate-400">Live data from CoinGecko and SideShift APIs</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Price Oracle Section */}
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-white">Live Crypto Prices</h2>
                <span className="px-3 py-1 bg-green-900/20 text-green-400 rounded-full text-xs font-medium border border-green-700">
                  CoinGecko API
                </span>
              </div>

              {pricesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-slate-400 mt-4">Fetching prices...</p>
                </div>
              ) : Object.keys(prices).length === 0 ? (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">
                    Failed to load prices. Please check your internet connection and try refreshing the page.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(prices).map(([symbol, data]) => {
                    // Skip if data is invalid
                    if (!data || typeof data.price !== 'number') {
                      return null;
                    }
                    
                    const change = formatPriceChange(data.change24h);
                    return (
                      <div
                        key={symbol}
                        className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold text-lg">{symbol}</h3>
                            <p className="text-slate-400 text-sm">
                              Updated {new Date(data.lastUpdated).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold text-xl">
                              {formatPrice(data.price)}
                            </p>
                            <p className={`text-sm font-medium ${change.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {change.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>✓ Real-time data:</strong> Prices update every 60 seconds from CoinGecko API
                </p>
              </div>
            </div>
          </div>

          {/* SideShift Section */}
          <div className="space-y-6">
            {/* Get Quote */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-white">SideShift Quote</h2>
                <span className="px-3 py-1 bg-purple-900/20 text-purple-400 rounded-full text-xs font-medium border border-purple-700">
                  SideShift API
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Deposit Coin</label>
                  <input
                    type="text"
                    value={quoteParams.depositCoin}
                    onChange={(e) => setQuoteParams({ ...quoteParams, depositCoin: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="eth"
                  />
                  <p className="text-xs text-slate-500 mt-1">Examples: eth, btc, usdt, sol</p>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Settle Coin</label>
                  <input
                    type="text"
                    value={quoteParams.settleCoin}
                    onChange={(e) => setQuoteParams({ ...quoteParams, settleCoin: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="btc"
                  />
                  <p className="text-xs text-slate-500 mt-1">Examples: btc, eth, usdc, matic</p>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Amount</label>
                  <input
                    type="text"
                    value={quoteParams.depositAmount}
                    onChange={(e) => setQuoteParams({ ...quoteParams, depositAmount: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="1"
                  />
                  <p className="text-xs text-slate-500 mt-1">Amount to swap (e.g., 1, 0.5, 100)</p>
                </div>

                <button
                  onClick={handleGetQuote}
                  disabled={shiftLoading}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  {shiftLoading ? 'Getting Quote...' : 'Get Quote'}
                </button>

                {shiftError && (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                    <p className="text-red-300 text-sm">{shiftError}</p>
                  </div>
                )}

                {quote && (
                  <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-3">
                    <h3 className="text-white font-semibold">Quote Result:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Quote ID:</span>
                        <span className="text-white font-mono">{quote.id.slice(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deposit:</span>
                        <span className="text-white">{quote.depositAmount} {quote.depositCoin.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Receive:</span>
                        <span className="text-green-400 font-semibold">{quote.settleAmount} {quote.settleCoin.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rate:</span>
                        <span className="text-white">{quote.rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Expires:</span>
                        <span className="text-yellow-400">{new Date(quote.expiresAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Check Order Status */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Check Order Status</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Order ID</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter SideShift order ID"
                  />
                </div>

                <button
                  onClick={handleCheckStatus}
                  disabled={!orderId || shiftLoading}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  {shiftLoading ? 'Checking...' : 'Check Status'}
                </button>

                {orderStatus && (
                  <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-3">
                    <h4 className="text-white font-semibold">Order Status:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          orderStatus.status === 'settled' ? 'bg-green-900/20 text-green-400 border-green-700' :
                          orderStatus.status === 'waiting' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-700' :
                          'bg-blue-900/20 text-blue-400 border-blue-700'
                        }`}>
                          {formatShiftStatus(orderStatus.status).label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deposit Address:</span>
                        <span className="text-white font-mono text-xs">{orderStatus.depositAddress?.slice(0, 20)}...</span>
                      </div>
                      {orderStatus.depositHash && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Deposit TX:</span>
                          <span className="text-blue-400 font-mono text-xs">{orderStatus.depositHash.slice(0, 20)}...</span>
                        </div>
                      )}
                      {orderStatus.settleHash && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Settle TX:</span>
                          <span className="text-green-400 font-mono text-xs">{orderStatus.settleHash.slice(0, 20)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-8 bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Integration Status</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <div>
                  <p className="text-green-400 font-semibold">CoinGecko API</p>
                  <p className="text-slate-400 text-sm">Real-time prices</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <div>
                  <p className="text-green-400 font-semibold">SideShift API</p>
                  <p className="text-slate-400 text-sm">Cross-chain swaps</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <div>
                  <p className="text-green-400 font-semibold">Safe SDK</p>
                  <p className="text-slate-400 text-sm">Multi-sig support</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
