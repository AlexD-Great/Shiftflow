# ShiftFlow

**Stop building swaps. Start building workflows.**

ShiftFlow is a conditional execution layer for cross-chain DeFi that enables developers to compose multi-step, automated workflows triggered by custom conditions.

## 🎯 What is ShiftFlow?

ShiftFlow transforms the SideShift.ai API from a simple swap tool into a powerful automation platform. Define workflows like:

- **"When ETH drops below $3000, swap 1 ETH from Arbitrum to BTC"**
- **"When a new pool on Base launches with APR > 25%, bridge and deposit liquidity"**
- **"When AI predicts a downtrend, rebalance treasury from ETH to BTC"**

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ShiftFlow Platform                    │
├─────────────────────────────────────────────────────────┤
│  Frontend (Next.js)  │  Backend (Node.js)  │  SDK (NPM) │
│  - Workflow Builder  │  - Execution Engine │  - Types   │
│  - Dashboard         │  - SideShift API    │  - Client  │
│  - Monitoring        │  - State Machine    │  - Hooks   │
└─────────────────────────────────────────────────────────┘
```

## 📦 Packages

- **`@shiftflow/engine`** - Backend workflow execution engine
- **`@shiftflow/web`** - Frontend workflow builder and dashboard
- **`@shiftflow/sdk`** - TypeScript SDK for developers

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

## 🔧 Environment Variables

```env
# SideShift API
SIDESHIFT_SECRET=your_private_key
AFFILIATE_ID=your_account_id

# Database
DATABASE_URL=postgresql://...

# Optional: Price Oracles
COINGECKO_API_KEY=your_key
```

## 📚 Documentation

- [Getting Started](./docs/getting-started.md)
- [API Reference](./docs/api-reference.md)
- [Workflow Examples](./docs/examples.md)

## 🎮 Demo Workflows

### 1. DeFi Sniper
Automatically detect high-yield pools and execute cross-chain liquidity provision.

### 2. AI Treasury Manager
Use AI predictions to rebalance treasury assets across chains.

### 3. Gaming Cash-Out
Automatically convert in-game tokens to stablecoins when thresholds are met.

## 🏆 Built for SideShift Wave Hack

ShiftFlow showcases the power of the SideShift.ai API by enabling:
- ✅ Complex multi-step workflows
- ✅ Conditional execution logic
- ✅ Cross-chain automation
- ✅ Developer-friendly SDK
- ✅ Non-custodial architecture

## 📄 License

MIT
