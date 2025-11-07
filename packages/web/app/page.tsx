export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            ShiftFlow
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Conditional execution layer for cross-chain DeFi
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/demo/safe"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              🔐 Smart Account Demo
            </a>
            <a
              href="/builder"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Build Workflow
            </a>
            <a
              href="/dashboard"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              View Dashboard
            </a>
            <a
              href="https://github.com/AlexD-Great/Shiftflow"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              GitHub
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
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Example Workflows</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-3">Price-Based Triggers</h3>
              <p className="text-slate-400 mb-4">
                Automatically execute swaps when prices hit your targets
              </p>
              <pre className="bg-slate-900 p-4 rounded text-sm text-slate-300 overflow-x-auto">
{`whenPriceIs('ETH', 'below', 3000)
  .thenSwap({
    from: 'eth/arbitrum',
    to: 'btc/bitcoin'
  })`}
              </pre>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-3">Treasury Management</h3>
              <p className="text-slate-400 mb-4">
                Rebalance holdings based on market conditions
              </p>
              <pre className="bg-slate-900 p-4 rounded text-sm text-slate-300 overflow-x-auto">
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
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
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
              href="https://github.com/AlexD-Great/Shiftflow/blob/main/QUICKSTART.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Quick Start Guide
            </a>
            <a
              href="https://github.com/AlexD-Great/Shiftflow/blob/main/docs/EXAMPLES.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              View Examples
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 text-center text-slate-500">
          <p>Built for SideShift Wave Hack - Wave 2</p>
          <p className="mt-2">
            <a href="https://github.com/AlexD-Great" className="hover:text-slate-400 transition-colors">
              @AlexD-Great
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
