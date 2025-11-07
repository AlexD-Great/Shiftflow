# ShiftFlow - SideShift Wave Hack Submission

## Project Info

**Name**: ShiftFlow  
**Track**: Cross-Chain Power in DeFi  
**Repository**: https://github.com/AlexD-Great/Shiftflow  
**Live Demo**: https://shiftflow-web.vercel.app/  
**Developer**: AlexD-Great

## What I Built

ShiftFlow is a conditional execution layer for cross-chain DeFi. Think of it as automation infrastructure for SideShift - instead of manually executing swaps, you define conditions and actions, then let the system handle it.

## The Problem

I've been using DeFi for a while now, and one thing that always frustrated me was the manual nature of everything. You have to constantly watch prices, manually execute swaps across different chains, and hope you don't miss opportunities while you're asleep or busy.

Most existing tools are just UIs for swapping - they don't actually solve the automation problem. And the few automation tools that exist are either custodial (you have to trust them with your funds) or limited to single chains.

## My Solution

ShiftFlow adds a workflow layer on top of SideShift's cross-chain swap API. You define:
- **Conditions**: "When ETH drops below $3000" or "When BTC hits $100k"
- **Actions**: "Swap X amount from Chain A to Chain B"

The system monitors conditions and executes actions automatically. It's non-custodial - you're just defining logic, not handing over your keys.

## Technical Implementation

### Backend Engine (`packages/engine`)

The core is a Node.js workflow engine that:
- Polls price oracles (CoinGecko) to check conditions
- Manages the full SideShift API lifecycle (quote → fixed shift → monitoring)
- Handles state management and error recovery
- Runs workflows in a continuous monitoring loop

Key files:
- `workflow-engine.ts` - Core orchestration logic
- `sideshift.ts` - SideShift API client
- `price-oracle.ts` - Price monitoring service

### TypeScript SDK (`packages/sdk`)

I wanted other developers to be able to integrate this easily, so I built a clean SDK with a fluent API:

```typescript
const workflow = createWorkflow()
  .id('my-workflow')
  .name('BTC Profit Taking')
  .whenPriceIs('BTC', 'above', 100000)
  .thenSwap({
    amount: '0.01',
    fromCoin: 'btc',
    fromNetwork: 'bitcoin',
    toCoin: 'usdc',
    toNetwork: 'arbitrum',
    toAddress: 'your_address'
  })
  .build();
```

### SideShift Integration

The integration handles the complete SideShift workflow:

1. **Quote Request**: Get current rates and limits
2. **Fixed Shift Creation**: Lock in the rate
3. **Deposit Monitoring**: Wait for user deposit
4. **Settlement Tracking**: Monitor until completion

All error cases are handled - network failures, rate changes, timeout scenarios, etc.

## Use Cases

**DeFi Sniper**: Automatically enter positions when prices hit targets
```typescript
whenPriceIs('ETH', 'below', 3000)
  .thenSwap({ from: 'eth/arbitrum', to: 'btc/bitcoin' })
```

**Treasury Management**: Rebalance holdings based on market conditions
```typescript
whenPriceIs('BTC', 'above', 100000)
  .thenSwap({ from: 'btc/bitcoin', to: 'usdc/arbitrum' })
```

**Gaming**: Auto-convert in-game tokens to stablecoins
```typescript
whenPriceIs('AVAX', 'above', 40)
  .thenSwap({ from: 'avax/avalanche', to: 'usdc/polygon' })
```

## What's Working

### Core Features ✅
- Complete SideShift API integration (quote, shift, monitoring)
- Price oracle monitoring (CoinGecko)
- Workflow engine with multi-condition evaluation (AND/OR logic)
- TypeScript SDK with fluent API
- Working demo that monitors ETH price
- Comprehensive documentation

### Smart Account Integration ✅
- **Safe (Gnosis Safe) SDK integration** - Full multi-sig workflow support
- Transaction proposal and approval system
- Balance and owner management
- SideShift swaps through Safe accounts
- Automatic routing when `safeAddress` is set

### Advanced Workflows ✅
- **Multi-condition logic** - AND/OR operators for complex conditions
- **Multiple condition types** - Price, time, balance, gas thresholds
- **Multi-step actions** - Sequential swap → notify → webhook chains
- **Notification system** - Email, Telegram, Discord integrations
- **Webhook support** - Trigger external systems

### User Interface ✅
- **Interactive Workflow Builder** - Visual form-based workflow creation
- **Real-Time Dashboard** - Live monitoring with execution history
- **Live Preview** - See generated JSON as you build
- **Safe Integration UI** - Toggle multi-sig execution
- **Deployed on Vercel** - https://shiftflow-web.vercel.app/

## What's Next

**Short term**:
- Database persistence for workflow history
- User authentication and workflow management
- More condition types (liquidity-based, on-chain events)

**Long term**:
- Smart contract integration for trustless execution
- AI-powered condition triggers
- Enterprise features (team management, permissions)
- Mobile app

## Why This Matters for SideShift

Most hackathon projects build yet another swap UI. I wanted to build something that makes SideShift more valuable - infrastructure that other developers can build on.

This turns SideShift from "a swap API" into "the automation layer for cross-chain DeFi". It's the kind of thing that could drive serious API usage and developer adoption.

## Technical Stack

- **Frontend:** Next.js 15, React 18, Tailwind CSS
- **Backend:** TypeScript, Node.js
- **Smart Accounts:** Safe (Gnosis Safe) Protocol Kit & API Kit
- **APIs:** SideShift v2, CoinGecko
- **Deployment:** Vercel (auto-deploy from GitHub)
- **Monorepo:** Turborepo structure

## Running It

```bash
git clone https://github.com/AlexD-Great/Shiftflow.git
cd Shiftflow
npm install

cd packages/engine
cp .env.example .env
# Add your SideShift credentials
npm run dev
```

The demo monitors ETH price and will execute a swap when it drops below $3000.

## Links

- **Repository**: https://github.com/AlexD-Great/Shiftflow
- **Demo Video**: [Coming soon]
- **Documentation**: See README and docs/ folder

## Contact

- **GitHub**: @AlexD-Great
- **Repository**: https://github.com/AlexD-Great/Shiftflow

---

Built for SideShift Wave Hack - Wave 2
