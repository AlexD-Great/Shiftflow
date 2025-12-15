export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 max-w-7xl">
        {/* Beta Banner */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-full">
            <span className="text-yellow-400 text-xs sm:text-sm font-medium">🚧 BETA</span>
            <span className="text-slate-300 text-xs sm:text-sm">Currently in testing phase - Join our beta program!</span>
          </div>
        </div>

        {/* Header */}
        <header className="text-center mb-12 sm:mb-20">
          <div className="mb-6">
            <div className="inline-block p-4 bg-blue-600/10 rounded-2xl mb-4">
              <div className="text-6xl">⚡</div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            ShiftFlow
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-4 font-light">
            Automate Your Cross-Chain DeFi Strategy
          </p>
          <p className="text-base sm:text-lg text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Set conditions, define actions, and let ShiftFlow execute your workflows automatically across multiple blockchains
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/builder"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-2">
                <span>Build Workflow</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </a>
            <a
              href="/demo/safe"
              className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-2">
                <span>🔐 Smart Account Demo</span>
              </div>
            </a>
            <a
              href="/templates"
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-2">
                <span>📚 Browse Templates</span>
              </div>
            </a>
          </div>
        </header>

        {/* What it does */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">What This Does</h2>
          <p className="text-slate-300 text-lg mb-4">
            I built ShiftFlow because I was tired of manually monitoring prices and executing swaps across different chains. 
            The idea is simple: define what you want to happen and when, then let the system handle it.
          </p>
          <p className="text-slate-300 text-lg">
            It's built on top of SideShift's API, which handles the actual cross-chain swaps. ShiftFlow adds the automation layer.
          </p>
        </section>

        {/* Examples */}
        <section className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Example Workflows</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Price-Based Triggers</h3>
              <p className="text-sm sm:text-base text-slate-400 mb-4">
                Automatically execute swaps when prices hit your targets
              </p>
              <pre className="bg-slate-900 p-3 sm:p-4 rounded text-xs sm:text-sm text-slate-300 overflow-x-auto">
{`whenPriceIs('ETH', 'below', 3000)
  .thenSwap({
    from: 'eth/arbitrum',
    to: 'btc/bitcoin'
  })`}
              </pre>
            </div>

            <div className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Treasury Management</h3>
              <p className="text-sm sm:text-base text-slate-400 mb-4">
                Rebalance holdings based on market conditions
              </p>
              <pre className="bg-slate-900 p-3 sm:p-4 rounded text-xs sm:text-sm text-slate-300 overflow-x-auto">
{`whenPriceIs('BTC', 'above', 100000)
  .thenSwap({
    from: 'btc/bitcoin',
    to: 'usdc/arbitrum'
  })`}
              </pre>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">Backend Engine</h3>
              <ul className="text-slate-400 space-y-2">
                <li>• Monitors conditions</li>
                <li>• Executes workflows</li>
                <li>• Handles SideShift API</li>
              </ul>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">TypeScript SDK</h3>
              <ul className="text-slate-400 space-y-2">
                <li>• Clean API</li>
                <li>• Type-safe</li>
                <li>• Easy integration</li>
              </ul>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">Non-Custodial</h3>
              <ul className="text-slate-400 space-y-2">
                <li>• Your keys</li>
                <li>• Your control</li>
                <li>• Your funds</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Technical Stack</h2>
          <div className="flex flex-wrap gap-3">
            {['TypeScript', 'Node.js', 'Next.js', 'SideShift API', 'CoinGecko', 'Tailwind CSS'].map((tech) => (
              <span key={tech} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-8">
            Check out the documentation and start building automated workflows
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://github.com/AlexD-Great/Shiftflow#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Documentation
            </a>
            <a
              href="/builder"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Try It Now
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 text-center text-slate-500">
          <div className="mb-4">
            <a 
              href="/admin/test-data" 
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
            >
              📊 Admin Dashboard
            </a>
          </div>
          <p>© 2025 ShiftFlow. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
