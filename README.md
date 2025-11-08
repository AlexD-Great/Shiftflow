# ShiftFlow ⚡

**Automate Your Cross-Chain DeFi Strategy**

A conditional execution layer for cross-chain DeFi operations with Smart Account integration, gas optimization, and real blockchain connectivity.

**🚀 Live Demo:** https://shiftflow-web.vercel.app/

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AlexD-Great/Shiftflow)

## ✨ Key Features

- 🔐 **Smart Account Integration** - Execute workflows through Safe (Gnosis Safe) multi-sig accounts
- ⛽ **Gas Price Optimization** - Trigger actions only when gas prices are favorable
- 📚 **Workflow Templates** - 8 pre-built templates for common DeFi strategies
- 🔌 **Real Wallet Connection** - Connect MetaMask, WalletConnect, and more
- 🌐 **Cross-Chain Swaps** - Powered by SideShift API
- 📊 **Real-Time Dashboard** - Monitor active workflows
- 🎨 **Professional UI** - Clean, modern interface with sidebar navigation

## What This Does

ShiftFlow automates cross-chain DeFi operations based on conditions you define. Set it and forget it.

**Example Workflows:**
- Swap ETH to BTC when price drops below $3000 AND gas is below 20 gwei
- Execute multi-sig treasury rebalancing on a schedule
- Auto-compound yields when conditions are optimal
- DCA (Dollar Cost Average) into assets at specific intervals

Built on SideShift's API for reliable cross-chain swaps, with an intelligent automation layer on top.

## How It Works

The system has three main parts:

**Backend Engine** (`packages/engine`)
- Monitors conditions (price thresholds, time triggers, etc.)
- Executes workflows when conditions are met
- Handles the full SideShift API lifecycle

**TypeScript SDK** (`packages/sdk`)
- Clean API for creating workflows
- Type-safe interfaces
- Easy integration into existing projects

**Frontend** (`packages/web`)
- Interactive workflow builder with live preview
- Real-time monitoring dashboard
- Smart Account (Safe) integration UI

## Getting Started

You'll need a SideShift account first. Go to https://sideshift.ai/account and grab your private key and account ID.

```bash
# Clone and install
git clone https://github.com/AlexD-Great/Shiftflow.git
cd Shiftflow
npm install

# Set up your credentials
cd packages/engine
cp .env.example .env
# Edit .env with your SideShift credentials

# Run the demo
npm run dev
```

The demo workflow monitors ETH price and will trigger a swap when it drops below $3000. You can modify the conditions in `packages/engine/src/demo.ts`.

## Example Workflows

I've included several example workflows in the docs:

**Price-Based Triggers**
```typescript
const workflow = createWorkflow()
  .whenPriceIs('ETH', 'below', 3000)
  .thenSwap({
    from: 'eth/arbitrum',
    to: 'btc/bitcoin',
    amount: '0.1'
  })
  .build();
```

**Treasury Management**
- Automatically rebalance when BTC hits certain thresholds
- Move profits to stablecoins
- DCA strategies

Check `docs/EXAMPLES.md` for more.

## Why I Built This

Most DeFi tools are just UIs for swapping tokens. I wanted something that could actually automate strategies. SideShift has a solid API for cross-chain swaps, but there's no good way to trigger them conditionally.

This project fills that gap. It's infrastructure that other developers can build on top of.

## Screenshots

### Homepage
![ShiftFlow Homepage](./screenshots/homepage.png)

### Workflow Builder
![Workflow Builder](./screenshots/builder.png)

### Real-Time Dashboard
![Dashboard](./screenshots/dashboard.png)

## Technical Stack

- **Frontend:** Next.js 15, React 18, Tailwind CSS
- **Backend:** TypeScript, Node.js
- **Smart Accounts:** Safe (Gnosis Safe) SDK
- **APIs:** SideShift v2, CoinGecko
- **Deployment:** Vercel

## Documentation

- [Quick Start Guide](./QUICKSTART.md)
- [Architecture Details](./ARCHITECTURE.md)
- [Workflow Examples](./docs/EXAMPLES.md)
- [SDK Documentation](./packages/sdk/README.md)

## License

MIT
