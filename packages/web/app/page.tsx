const trustSignals = [
  { label: 'Supported Networks', value: '12+' },
  { label: 'Integrated Assets', value: '50+' },
  { label: 'Templates Ready', value: '8' },
  { label: 'Monitoring Cadence', value: '60s' },
];

const coreCapabilities = [
  {
    title: 'Signal-Driven Automation',
    copy: 'Trigger cross-chain actions from price, gas, and schedule signals without babysitting charts.',
  },
  {
    title: 'Execution Controls',
    copy: 'Set required vs preferred conditions so urgent workflows execute while non-critical checks stay optional.',
  },
  {
    title: 'Treasury-Ready Safety',
    copy: 'Route actions through wallet approvals and Safe-compatible flows when governance needs tighter controls.',
  },
];

const workflowExamples = [
  {
    title: 'Smart Accumulation',
    description: 'Accumulate BTC when ETH weakens below your level while keeping gas overhead constrained.',
    snippet: `WHEN ETH < $3,000\nPREFER gas < 20 gwei\nTHEN swap ETH/Arbitrum → BTC/Bitcoin`,
  },
  {
    title: 'Recurring Treasury Ops',
    description: 'Run weekly treasury actions with notifications to keep teams aligned on execution windows.',
    snippet: `WHEN schedule = weekly\nTHEN notify ops + execute configured action`,
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute top-44 -left-24 h-[320px] w-[320px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[340px] w-[340px] rounded-full bg-purple-600/15 blur-[140px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/20 ring-1 ring-cyan-300/20">⚡</div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">ShiftFlow</p>
              <p className="text-xs text-slate-400">Cross-chain automation platform</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="/templates" className="transition-colors hover:text-white">Templates</a>
            <a href="/builder" className="transition-colors hover:text-white">Builder</a>
            <a href="/admin/test-data" className="transition-colors hover:text-white">Dashboard</a>
          </div>
          <a href="/builder" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200">
            Try Builder
          </a>
        </nav>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8 lg:p-10">
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">
              Built for real DeFi operations
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Automate your
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                cross-chain workflows
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              ShiftFlow helps teams and power users design condition-based workflows that monitor markets, validate execution rules, and trigger the right actions at the right time.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/builder" className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/40 transition hover:brightness-110">
                Start Building
              </a>
              <a href="/templates" className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/5">
                Explore Templates
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {trustSignals.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                  <p className="text-xs text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-xl sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Execution Preview</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                <p className="text-sm font-medium text-cyan-200">Condition Set</p>
                <p className="mt-2 text-sm text-slate-300">ETH below $3,000 + preferred gas threshold + Arbitrum route</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">Action Route</p>
                <p className="mt-2 text-sm text-slate-300">Execute SideShift swap and send execution notification</p>
              </div>
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                <p className="text-sm font-medium text-emerald-200">Status</p>
                <p className="mt-2 text-sm text-slate-300">Monitoring live market and network conditions every 60 seconds</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Designed for teams that move capital cross-chain</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {coreCapabilities.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {workflowExamples.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.description}</p>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/25 p-4 text-xs text-cyan-100">
{item.snippet}
              </pre>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-6 text-center sm:p-8">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Want early access before full public launch?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Use the builder, test templates, and share feedback. We are prioritizing real workflows used by real users before broader rollout.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="/builder" className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
              Try Builder
            </a>
            <a href="https://github.com/AlexD-Great/Shiftflow/discussions" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Share Feedback
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
