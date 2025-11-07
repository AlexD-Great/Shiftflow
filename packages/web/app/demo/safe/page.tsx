'use client';

import { useState } from 'react';

export default function SafeDemoPage() {
  const [step, setStep] = useState(1);
  const [isExecuting, setIsExecuting] = useState(false);

  const safeData = {
    address: '0x1234...5678',
    owners: [
      { address: '0xAlice...1234', name: 'Alice', approved: false },
      { address: '0xBob...5678', name: 'Bob', approved: false },
      { address: '0xCarol...9012', name: 'Carol', approved: false },
    ],
    threshold: 2,
    balance: '5.42 ETH',
  };

  const workflow = {
    name: 'DeFi Sniper',
    condition: 'When ETH price < $3000',
    action: 'Swap 1 ETH (Arbitrum) → BTC (Bitcoin)',
  };

  const handleProposeTransaction = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setStep(2);
      setIsExecuting(false);
    }, 1500);
  };

  const handleApprove = (index: number) => {
    safeData.owners[index].approved = true;
    setStep(3);
    
    // Check if threshold met
    const approvalCount = safeData.owners.filter(o => o.approved).length;
    if (approvalCount >= safeData.threshold) {
      setTimeout(() => setStep(4), 1000);
      setTimeout(() => setStep(5), 3000);
    }
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setStep(5);
      setIsExecuting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Home
          </a>
          <h1 className="text-4xl font-bold mb-2">Smart Account Demo</h1>
          <p className="text-slate-400 text-lg">
            See how ShiftFlow executes workflows through Safe (Gnosis Safe) multi-sig accounts
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[
              { num: 1, label: 'Setup' },
              { num: 2, label: 'Propose' },
              { num: 3, label: 'Approve' },
              { num: 4, label: 'Execute' },
              { num: 5, label: 'Complete' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      step >= s.num
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className="text-sm mt-2 text-slate-400">{s.label}</span>
                </div>
                {i < 4 && (
                  <div
                    className={`w-24 h-1 mx-2 transition-all ${
                      step > s.num ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Safe Info */}
          <div className="space-y-6">
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
                {safeData.owners.map((owner, i) => (
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
                    {step >= 3 && owner.approved && (
                      <span className="text-green-400 text-xl">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3 text-blue-300">
                💡 How It Works
              </h3>
              <ol className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">1.</span>
                  <span>Workflow condition is met (e.g., ETH price drops)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">2.</span>
                  <span>ShiftFlow proposes transaction to Safe</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">3.</span>
                  <span>Safe owners review and approve</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">4.</span>
                  <span>Once threshold met, transaction executes</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">5.</span>
                  <span>SideShift swap completes cross-chain</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column - Workflow Execution */}
          <div className="space-y-6">
            {/* Workflow Info */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4">⚡ Active Workflow</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 text-sm">Name</span>
                  <div className="text-lg font-bold mt-1">{workflow.name}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Condition</span>
                  <div className="bg-purple-900/30 border border-purple-700/50 p-3 rounded mt-1">
                    {workflow.condition}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Action</span>
                  <div className="bg-blue-900/30 border border-blue-700/50 p-3 rounded mt-1">
                    {workflow.action}
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Steps */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4">📋 Execution Log</h2>
              <div className="space-y-3 font-mono text-sm">
                {step >= 1 && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <div>
                      <div className="text-slate-300">Workflow condition met</div>
                      <div className="text-slate-500 text-xs">
                        ETH price: $2,950 (below threshold)
                      </div>
                    </div>
                  </div>
                )}
                {step >= 2 && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <div>
                      <div className="text-slate-300">Transaction proposed to Safe</div>
                      <div className="text-slate-500 text-xs">
                        Tx Hash: 0xabcd...ef12
                      </div>
                    </div>
                  </div>
                )}
                {step >= 3 && (
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">⏳</span>
                    <div>
                      <div className="text-slate-300">Awaiting approvals</div>
                      <div className="text-slate-500 text-xs">
                        {safeData.owners.filter(o => o.approved).length} of{' '}
                        {safeData.threshold} signatures collected
                      </div>
                    </div>
                  </div>
                )}
                {step >= 4 && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <div>
                      <div className="text-slate-300">Threshold reached</div>
                      <div className="text-slate-500 text-xs">
                        Executing transaction...
                      </div>
                    </div>
                  </div>
                )}
                {step >= 5 && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <div>
                      <div className="text-slate-300">Swap completed</div>
                      <div className="text-slate-500 text-xs">
                        Received 0.042 BTC on Bitcoin network
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4">🎮 Demo Controls</h2>
              <div className="space-y-3">
                {step === 1 && (
                  <button
                    onClick={handleProposeTransaction}
                    disabled={isExecuting}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                  >
                    {isExecuting ? 'Proposing...' : 'Propose Transaction'}
                  </button>
                )}
                {step === 2 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400 mb-3">
                      Simulate owner approvals:
                    </p>
                    {safeData.owners.map((owner, i) => (
                      <button
                        key={i}
                        onClick={() => handleApprove(i)}
                        disabled={owner.approved}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded font-medium transition-colors text-sm"
                      >
                        {owner.approved ? '✓ Approved' : `Approve as ${owner.name}`}
                      </button>
                    ))}
                  </div>
                )}
                {step === 3 && (
                  <div className="text-center py-4">
                    <div className="text-yellow-400 text-4xl mb-2">⏳</div>
                    <div className="text-slate-300">
                      Waiting for threshold...
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Need {safeData.threshold - safeData.owners.filter(o => o.approved).length} more approval(s)
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <button
                    onClick={handleExecute}
                    disabled={isExecuting}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                  >
                    {isExecuting ? 'Executing...' : 'Execute Transaction'}
                  </button>
                )}
                {step === 5 && (
                  <div className="text-center py-4">
                    <div className="text-green-400 text-4xl mb-2">✓</div>
                    <div className="text-xl font-bold text-green-400 mb-2">
                      Transaction Complete!
                    </div>
                    <div className="text-sm text-slate-400 mb-4">
                      Swap executed successfully through Safe multi-sig
                    </div>
                    <button
                      onClick={() => {
                        setStep(1);
                        safeData.owners.forEach(o => o.approved = false);
                      }}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
                    >
                      Reset Demo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-bold mb-2">Secure</h3>
            <p className="text-slate-400 text-sm">
              No single point of failure. Multiple signatures required for execution.
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-bold mb-2">Automated</h3>
            <p className="text-slate-400 text-sm">
              Workflows execute automatically when conditions are met.
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="text-lg font-bold mb-2">Cross-Chain</h3>
            <p className="text-slate-400 text-sm">
              Seamlessly swap assets across different blockchain networks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
