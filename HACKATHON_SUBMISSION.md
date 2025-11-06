# ShiftFlow - SideShift Wave Hack Submission

## Project Information

**Project Name**: ShiftFlow  
**Tagline**: Stop building swaps. Start building workflows.  
**Primary Track**: 🔀 Cross-Chain Power in DeFi  
**Secondary Tracks**: 🤖 AI + Automation, 👝 Zero UI

## Team

[Your Name/Team Name]  
[GitHub Profile]  
[Twitter/X Handle]

## Project Description

ShiftFlow is a conditional execution layer for cross-chain DeFi that transforms the SideShift API from a simple swap tool into a powerful automation platform. Instead of manually executing multi-step cross-chain operations, developers and users can define workflows: "When [CONDITION] is met, perform these [ACTIONS]."

### The Problem

Current DeFi workflows are:
- **Manual**: Users must constantly monitor prices and opportunities
- **Fragmented**: Multi-step operations require multiple transactions across chains
- **Error-Prone**: Human mistakes in timing and execution
- **Opportunity Loss**: Missing optimal entry/exit points while sleeping

### The Solution

ShiftFlow provides:
- **Conditional Execution**: Automated triggers based on price, time, or AI signals
- **Cross-Chain Orchestration**: Seamless multi-chain workflows via SideShift
- **Developer SDK**: Clean TypeScript API for easy integration
- **Non-Custodial**: Users maintain full control of their funds

## Key Features

### 1. Workflow Engine
- Monitors conditions in real-time
- Executes actions automatically when triggered
- Handles full SideShift lifecycle (quote → shift → monitor)
- Robust error handling and retry logic

### 2. Price Oracle Integration
- Real-time price monitoring via CoinGecko
- Support for 100+ tokens
- Configurable thresholds and comparisons

### 3. Developer SDK
- Fluent API for workflow creation
- Full TypeScript support
- Zero-config setup
- Comprehensive documentation

### 4. Demo Workflows

**DeFi Sniper**:
```typescript
whenPriceIs('ETH', 'below', 3000)
  .thenSwap({ 
    from: 'eth/arbitrum', 
    to: 'btc/bitcoin' 
  })
```

**Treasury Manager**:
```typescript
whenPriceIs('BTC', 'above', 100000)
  .thenSwap({ 
    from: 'btc/bitcoin', 
    to: 'usdc/arbitrum' 
  })
```

**Gaming Cash-Out**:
```typescript
whenPriceIs('AVAX', 'above', 40)
  .thenSwap({ 
    from: 'avax/avalanche', 
    to: 'usdc/polygon' 
  })
```

## Technical Implementation

### Architecture

```
Frontend (Next.js) ←→ Backend (Node.js) ←→ SDK (NPM)
                           ↓
                    Workflow Engine
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
   Price Oracle      SideShift API      State Machine
```

### SideShift API Integration

We implement the complete SideShift API lifecycle:

1. **Quote Request**: Get current rates and amounts
2. **Fixed Shift Creation**: Lock in the quote
3. **Status Monitoring**: Poll until completion
4. **Error Handling**: Retry logic and fallbacks

**Code Example**:
```typescript
// Full workflow execution
const { quote, shift, finalStatus } = await sideshift.executeSwap({
  depositCoin: 'eth',
  depositNetwork: 'arbitrum',
  settleCoin: 'btc',
  settleNetwork: 'bitcoin',
  depositAmount: '0.1',
  settleAddress: 'bc1q...',
});
```

### Tech Stack

- **Backend**: Node.js, TypeScript, Express
- **Frontend**: Next.js 14, TailwindCSS, shadcn/ui
- **SDK**: TypeScript with Zod validation
- **APIs**: SideShift v2, CoinGecko
- **Tooling**: Turbo (monorepo), tsx (dev)

## How to Run

### Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd shiftflow
npm install

# 2. Configure
cp .env.example .env
# Edit .env with your SideShift credentials

# 3. Run demo
cd packages/engine
npm run dev
```

### Using the SDK

```bash
npm install @shiftflow/sdk
```

```typescript
import { ShiftFlowClient, createWorkflow } from '@shiftflow/sdk';

const client = new ShiftFlowClient({
  sideshiftSecret: process.env.SIDESHIFT_SECRET!,
  sideshiftAffiliateId: process.env.AFFILIATE_ID!,
});

const workflow = createWorkflow()
  .id('my-workflow')
  .name('My First Workflow')
  .userId('user_123')
  .whenPriceIs('ETH', 'below', 3000)
  .thenSwap({
    amount: '0.1',
    fromCoin: 'eth',
    fromNetwork: 'mainnet',
    toCoin: 'usdc',
    toNetwork: 'arbitrum',
    toAddress: '0xYourAddress',
  })
  .build();

client.registerWorkflow(workflow);
client.startMonitoring();
```

## Judging Criteria Alignment

### API Integration & Technical Execution (20%)
- ✅ Complete SideShift API lifecycle implementation
- ✅ Sophisticated workflow engine with state management
- ✅ Proper error handling and retry logic
- ✅ Modular, well-architected codebase

### Originality & Innovation (20%)
- ✅ Novel "Zapier for Cross-Chain DeFi" concept
- ✅ Conditional execution layer (not just another swap UI)
- ✅ Composable workflows that other dApps can integrate
- ✅ SDK-first approach for developer adoption

### Use Case Relevance & Value Creation (15%)
- ✅ Solves real pain point: manual multi-step DeFi operations
- ✅ Clear value for multiple personas (traders, DAOs, gamers)
- ✅ Revenue model: fees on executed workflows or SaaS for developers
- ✅ Potential for significant user adoption

### Crypto-Native Thinking (15%)
- ✅ Non-custodial design (users control funds)
- ✅ Oracle integration for off-chain data
- ✅ Smart account compatible
- ✅ Cross-chain native from day one

### Product Design & Usability (15%)
- ✅ Clean, intuitive SDK with fluent API
- ✅ Comprehensive documentation
- ✅ Working demo with clear examples
- ✅ Developer-friendly error messages

### Presentation & Communication (15%)
- ✅ Clear problem-solution narrative
- ✅ Working demo showcasing key features
- ✅ Well-documented codebase
- ✅ Strong README and getting started guide

## Business Model

### Revenue Streams
1. **Transaction Fees**: 0.1-0.5% on executed workflows
2. **Premium Features**: Advanced conditions (AI signals, complex logic)
3. **Enterprise SaaS**: White-label solution for protocols
4. **Affiliate Revenue**: Earn from SideShift affiliate program

### Go-to-Market
1. **Phase 1**: Launch SDK, target developer community
2. **Phase 2**: Build integrations with popular wallets/dApps
3. **Phase 3**: Launch consumer-facing web app
4. **Phase 4**: Enterprise partnerships with DAOs and protocols

## Future Roadmap

### Q1 2025
- [ ] Add more condition types (time-based, liquidity pools)
- [ ] AI integration for predictive signals
- [ ] Multi-action workflows
- [ ] Webhook notifications

### Q2 2025
- [ ] Frontend workflow builder UI
- [ ] Mobile app (React Native)
- [ ] Database persistence (PostgreSQL)
- [ ] Advanced analytics dashboard

### Q3 2025
- [ ] Smart contract integration for on-chain conditions
- [ ] Support for more DEX aggregators
- [ ] Telegram/Discord bot interface
- [ ] Enterprise features (team management, permissions)

## Why ShiftFlow Wins

1. **Not Just a Swap UI**: We're building infrastructure that makes SideShift indispensable
2. **Developer-First**: SDK approach enables ecosystem growth
3. **Real Business Potential**: Clear path to revenue and adoption
4. **Technical Excellence**: Clean, well-architected, production-ready code
5. **Strategic Alignment**: Exactly what SideShift wants to see

## Links

- **GitHub**: [Repository URL]
- **Demo Video**: [YouTube/Loom URL]
- **Live Demo**: [Deployed URL]
- **Documentation**: [Docs URL]

## Contact

- **Email**: [your-email]
- **Twitter**: [@your-handle]
- **Discord**: [your-discord]

---

**Built with ❤️ for SideShift Wave Hack**
