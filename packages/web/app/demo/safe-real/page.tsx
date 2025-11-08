'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/wallet-connect';

export default function SafeRealDemoPage() {
  const { address, isConnected } = useAccount();
  const [safeAddress, setSafeAddress] = useState('');
  const [safeData, setSafeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSafeData = async () => {
    if (!safeAddress) {
      setError('Please enter a Safe address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Integrate with Safe SDK to load real data
      // For now, show a placeholder
      setSafeData({
        address: safeAddress,
        owners: [
          { address: address || '0x...', name: 'You' },
          { address: '0x...', name: 'Owner 2' },
          { address: '0x...', name: 'Owner 3' },
        ],
        threshold: 2,
        balance: '0 ETH',
      });
    } catch (err) {
      setError('Failed to load Safe data. Please check the address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/demo/safe" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Simulated Demo
          </a>
          <h1 className="text-4xl font-bold mb-2">Real Smart Account Demo</h1>
          <p className="text-slate-400 text-lg">
            Connect your wallet and interact with a real Safe account
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Step 1: Connect Wallet</h2>
          <WalletConnect />
          {isConnected && address && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-700/50 rounded">
              <p className="text-green-300 text-sm">
                ✓ Wallet connected successfully
              </p>
            </div>
          )}
        </div>

        {isConnected ? (
          <>
            {/* Safe Address Input */}
            <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4">Step 2: Load Safe Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Safe Address
                  </label>
                  <input
                    type="text"
                    value={safeAddress}
                    onChange={(e) => setSafeAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Enter a Safe address on Ethereum Mainnet or Sepolia testnet
                  </p>
                </div>
                <button
                  onClick={loadSafeData}
                  disabled={loading || !safeAddress}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Loading...' : 'Load Safe Data'}
                </button>
                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-700/50 rounded">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Safe Data Display */}
            {safeData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Safe Details */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🔐 Safe Account
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Address</span>
                      <div className="font-mono text-sm bg-slate-900 p-2 rounded mt-1">
                        {safeData.address}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Balance</span>
                      <div className="text-2xl font-bold text-green-400 mt-1">
                        {safeData.balance}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Signature Threshold</span>
                      <div className="text-lg font-bold mt-1">
                        {safeData.threshold} of {safeData.owners.length} required
                      </div>
                    </div>
                  </div>
                </div>

                {/* Owners */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h2 className="text-xl font-bold mb-4">👥 Owners</h2>
                  <div className="space-y-3">
                    {safeData.owners.map((owner: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-slate-900 p-3 rounded"
                      >
                        <div>
                          <div className="font-medium">{owner.name}</div>
                          <div className="text-sm text-slate-400 font-mono">
                            {owner.address}
                          </div>
                        </div>
                        {owner.address === address && (
                          <span className="text-blue-400 text-sm font-medium">You</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Workflow */}
                <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h2 className="text-xl font-bold mb-4">Step 3: Create Workflow</h2>
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
                    <p className="text-blue-300 mb-4">
                      Ready to create a workflow with this Safe account!
                    </p>
                    <div className="space-y-2 text-sm text-slate-300 mb-4">
                      <p>• Workflow will require {safeData.threshold} approvals</p>
                      <p>• Transactions will be proposed to the Safe</p>
                      <p>• You can approve using the Safe web app</p>
                    </div>
                    <div className="flex gap-3">
                      <a
                        href={`/builder?safe=${safeData.address}`}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-block"
                      >
                        Create Workflow
                      </a>
                      <a
                        href={`https://app.safe.global/home?safe=eth:${safeData.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors inline-block"
                      >
                        View in Safe App
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
            <div className="text-6xl mb-4">🔌</div>
            <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
            <p className="text-slate-400">
              Please connect your wallet to interact with real Safe accounts
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3 text-blue-300">
            💡 How This Works
          </h3>
          <ol className="space-y-2 text-sm text-slate-300">
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">1.</span>
              <span>Connect your wallet (MetaMask, WalletConnect, etc.)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">2.</span>
              <span>Enter a Safe address you own or have access to</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">3.</span>
              <span>Load the Safe data from the blockchain</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">4.</span>
              <span>Create workflows that execute through your Safe</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-400">5.</span>
              <span>Approve transactions in the Safe web app</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
