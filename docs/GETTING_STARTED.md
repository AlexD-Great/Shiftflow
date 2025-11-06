# Getting Started with ShiftFlow

## Prerequisites

- Node.js 18+ installed
- SideShift.ai account ([create one here](https://sideshift.ai/account))
- Basic understanding of DeFi and cross-chain swaps

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd shiftflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your SideShift credentials:

```env
SIDESHIFT_SECRET=your_private_key_here
AFFILIATE_ID=your_account_id_here
```

**Getting SideShift Credentials:**
1. Visit https://sideshift.ai/account
2. Your account will be automatically created
3. Copy your **Private Key** (keep this secret!)
4. Copy your **Account ID**

### 4. Run the Demo

Test the backend workflow engine:

```bash
cd packages/engine
npm run dev
```

This will start monitoring for the demo workflow condition.

### 5. Start the Frontend (Optional)

```bash
cd packages/web
npm run dev
```

Visit http://localhost:3000 to access the workflow builder UI.

## Your First Workflow

### Using the SDK

```typescript
import { ShiftFlowClient, createWorkflow } from '@shiftflow/sdk';

// Initialize client
const client = new ShiftFlowClient({
  sideshiftSecret: process.env.SIDESHIFT_SECRET!,
  sideshiftAffiliateId: process.env.AFFILIATE_ID!,
});

// Create a workflow
const workflow = createWorkflow()
  .id('my-first-workflow')
  .name('ETH Price Alert')
  .description('Swap ETH to USDC when price drops')
  .userId('user_123')
  .whenPriceIs('ETH', 'below', 3000, 'USD')
  .thenSwap({
    amount: '0.1',
    fromCoin: 'eth',
    fromNetwork: 'mainnet',
    toCoin: 'usdc',
    toNetwork: 'arbitrum',
    toAddress: '0xYourAddress',
  })
  .build();

// Register and start
client.registerWorkflow(workflow);
client.startMonitoring();
```

### Using the Web UI

1. Connect your wallet
2. Click "Create Workflow"
3. Set your condition (e.g., "When ETH < $3000")
4. Define your action (e.g., "Swap 0.1 ETH to USDC")
5. Activate the workflow

## Architecture Overview

```
ShiftFlow
├── packages/
│   ├── engine/          # Backend workflow execution
│   │   ├── services/
│   │   │   ├── sideshift.ts      # SideShift API client
│   │   │   ├── price-oracle.ts   # Price monitoring
│   │   │   └── workflow-engine.ts # Core engine
│   │   └── demo.ts      # Demo script
│   ├── sdk/             # TypeScript SDK
│   │   └── src/
│   │       ├── client.ts          # Main client
│   │       └── workflow-builder.ts # Fluent API
│   └── web/             # Next.js frontend
│       └── app/         # App router pages
```

## Next Steps

- [API Reference](./API_REFERENCE.md)
- [Workflow Examples](./EXAMPLES.md)
- [Deployment Guide](./DEPLOYMENT.md)

## Troubleshooting

### "Cannot find module" errors
Run `npm install` in the root directory.

### "Invalid SideShift credentials"
Double-check your `.env` file has the correct values from https://sideshift.ai/account

### Price oracle not working
The free CoinGecko API has rate limits. Add a `COINGECKO_API_KEY` to your `.env` for better limits.

## Support

- GitHub Issues: [Report a bug](https://github.com/yourrepo/issues)
- Documentation: [Full docs](./README.md)
- SideShift API: [Official docs](https://docs.sideshift.ai/)
