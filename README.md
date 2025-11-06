# ShiftFlow

A conditional execution layer for cross-chain DeFi operations.

## What This Does

I built ShiftFlow because I was tired of manually monitoring prices and executing swaps across different chains. The idea is simple: define what you want to happen and when, then let the system handle it.

For example:
- Swap ETH to BTC when the price drops below $3000
- Move assets between chains when certain conditions are met
- Automate treasury management based on market conditions

It's built on top of SideShift's API, which handles the actual cross-chain swaps. ShiftFlow adds the automation layer.

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

**Frontend** (`packages/web`) - Coming soon
- Visual workflow builder
- Dashboard for monitoring active workflows

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

## Technical Stack

- TypeScript throughout
- Node.js for the backend engine
- CoinGecko for price data
- SideShift API for cross-chain swaps

## Documentation

- [Quick Start Guide](./QUICKSTART.md)
- [Architecture Details](./ARCHITECTURE.md)
- [Workflow Examples](./docs/EXAMPLES.md)
- [SDK Documentation](./packages/sdk/README.md)

## License

MIT
