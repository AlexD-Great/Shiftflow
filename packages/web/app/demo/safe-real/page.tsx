'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/wallet-connect';
import { useSafe } from '@/hooks/useSafe';

// Example Safe addresses for testing
const EXAMPLE_SAFES = {
  mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC Safe on Mainnet
  sepolia: '0x...', // Add a Sepolia Safe if you have one
}

export default function SafeRealDemoPage() {
  const { address, isConnected, chain } = useAccount();
  const [safeAddress, setSafeAddress] = useState('');
  const { safeInfo, loading, error, loadSafeInfo, proposeTransaction } = useSafe();
  const [proposing, setProposing] = useState(false);
  const [proposalResult, setProposalResult] = useState<string | null>(null);

  const handleLoadSafe = async () => {
    if (!safeAddress) {
      return;
    }
    await loadSafeInfo(safeAddress);
  };

  const handleProposeWorkflow = async () => {
    if (!safeInfo) return;

    setProposing(true);
    setProposalResult(null);

    try {
      // Example: Propose a simple ETH transfer (you can customize this)
      const result = await proposeTransaction(
        '0x0000000000000000000000000000000000000000', // Placeholder address
        '0', // 0 ETH
        '0x', // No data
        1 // Ethereum mainnet
      );

      if (result) {
        setProposalResult(`Transaction proposed! Hash: ${result.safeTxHash}`);
      }
    } catch (err) {
      console.error('Proposal error:', err);
    } finally {
      setProposing(false);
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
              <p className="text-green-200 text-xs mt-1">
                Network: {chain?.name || 'Unknown'} (Chain ID: {chain?.id || 'N/A'})
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
                    Enter a Safe address that exists on <span className="font-semibold text-slate-400">{chain?.name || 'your current network'}</span>
                  </p>
                  <div className="mt-2 p-3 bg-blue-900/20 border border-blue-700/50 rounded">
                    <p className="text-blue-300 text-xs font-medium mb-1">💡 Don't have a Safe?</p>
                    <p className="text-blue-200 text-xs">
                      Create one at <a href="https://app.safe.global" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">app.safe.global</a> or use the simulated demo instead.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLoadSafe}
                  disabled={loading || !safeAddress}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Loading...' : 'Load Safe Data'}
                </button>
                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-700/50 rounded">
                    <p className="text-red-300 text-sm font-medium mb-2">❌ Error</p>
                    <p className="text-red-200 text-sm whitespace-pre-line">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Safe Data Display */}
            {safeInfo && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Safe Details */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🔐 Safe Account
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Address</span>
                      <div className="font-mono text-sm bg-slate-900 p-2 rounded mt-1 break-all">
                        {safeInfo.address}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Balance</span>
                      <div className="text-2xl font-bold text-green-400 mt-1">
                        {safeInfo.balance}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Signature Threshold</span>
                      <div className="text-lg font-bold mt-1">
                        {safeInfo.threshold} of {safeInfo.owners.length} required
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Nonce</span>
                      <div className="text-lg font-bold mt-1">
                        {safeInfo.nonce}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Owners */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h2 className="text-xl font-bold mb-4">👥 Owners</h2>
                  <div className="space-y-3">
                    {safeInfo.owners.map((ownerAddress: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-slate-900 p-3 rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-400 font-mono truncate">
                            {ownerAddress}
                          </div>
                        </div>
                        {ownerAddress.toLowerCase() === address?.toLowerCase() && (
                          <span className="text-blue-400 text-sm font-medium ml-2">You</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Workflow */}
                <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h2 className="text-xl font-bold mb-4">Step 3: Propose Transaction</h2>
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
                    <p className="text-blue-300 mb-4">
                      Ready to propose a transaction with this Safe account!
                    </p>
                    <div className="space-y-2 text-sm text-slate-300 mb-4">
                      <p>• Transaction will require {safeInfo.threshold} approvals</p>
                      <p>• Proposal will be sent to Safe Transaction Service</p>
                      <p>• Other owners can approve in the Safe web app</p>
                    </div>
                    
                    {proposalResult && (
                      <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded">
                        <p className="text-green-300 text-sm">{proposalResult}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={handleProposeWorkflow}
                        disabled={proposing}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                      >
                        {proposing ? 'Proposing...' : 'Propose Test Transaction'}
                      </button>
                      <a
                        href={`/builder?safe=${safeInfo.address}`}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors inline-block"
                      >
                        Create Workflow
                      </a>
                      <a
                        href={`https://app.safe.global/home?safe=eth:${safeInfo.address}`}
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
