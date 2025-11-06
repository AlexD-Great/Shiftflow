# Quick Start

This takes about 5 minutes.

## Prerequisites

- Node.js 18+
- SideShift account (free)

## Setup

**1. Get SideShift credentials**

Go to https://sideshift.ai/account and copy:
- Your Private Key (keep this secret)
- Your Account ID

**2. Install and configure**

```bash
git clone https://github.com/AlexD-Great/Shiftflow.git
cd Shiftflow
npm install

cd packages/engine
cp .env.example .env
```

Edit `.env` with your credentials:
```env
SIDESHIFT_SECRET=your_private_key
AFFILIATE_ID=your_account_id
```

**3. Run the demo**

```bash
cd packages/engine
npm install
npm run dev
```

You should see:
```
============================================================
ShiftFlow Demo: DeFi Sniper Workflow
============================================================

Workflow registered:
  ID: workflow_defi_sniper_001
  Name: DeFi Sniper: ETH Price Drop
  Condition: ETH below $3000
  Action: Swap 0.01 eth → btc

Starting workflow monitoring...
Press Ctrl+C to stop

[WorkflowEngine] Checking 1 active workflows
[WorkflowEngine] Price check: ETH = $3245.67 (threshold: below $3000) - NOT MET
```

### Step 5: Test with SDK

Create `test.ts`:

```typescript
import { ShiftFlowClient, createWorkflow } from '@shiftflow/sdk';

const client = new ShiftFlowClient({
  sideshiftSecret: process.env.SIDESHIFT_SECRET!,
  sideshiftAffiliateId: process.env.AFFILIATE_ID!,
});

const workflow = createWorkflow()
  .id('test-001')
  .name('My First Workflow')
  .userId('test_user')
  .whenPriceIs('BTC', 'above', 100000, 'USD')
  .thenSwap({
    amount: '0.01',
    fromCoin: 'btc',
    fromNetwork: 'bitcoin',
    toCoin: 'eth',
    toNetwork: 'mainnet',
    toAddress: '0xYourAddress',
  })
  .build();

client.registerWorkflow(workflow);
client.startMonitoring();
```

Run it:
```bash
npx tsx test.ts
```

## What's Running

The demo monitors ETH price every 30 seconds. When it drops below $3000, it'll execute a cross-chain swap from ETH on Arbitrum to BTC.

You can modify the workflow in `packages/engine/src/demo.ts` to:
- Change the token being monitored
- Adjust the price threshold
- Swap to different chains/tokens
- Change the amount

## Next Steps

**Create your own workflow**

```typescript
import { createWorkflow } from '@shiftflow/sdk';

const myWorkflow = createWorkflow()
  .id('my-workflow')
  .name('BTC Profit Taking')
  .userId('user_123')
  .whenPriceIs('BTC', 'above', 100000)
  .thenSwap({
    amount: '0.01',
    fromCoin: 'btc',
    fromNetwork: 'bitcoin',
    toCoin: 'usdc',
    toNetwork: 'arbitrum',
    toAddress: 'your_address_here'
  })
  .build();
```

**Integrate into your app**

The SDK is designed to be embedded in existing applications. Check `packages/sdk/README.md` for the full API.

## Troubleshooting

**Module not found errors**
```bash
npm install  # Run from root directory
```

**Invalid credentials**
- Check your `.env` file for typos
- Make sure there are no extra spaces
- Get fresh credentials from SideShift

**Workflow not triggering**
- Check the console logs to see current price vs threshold
- For testing, set a threshold that will definitely trigger
- Remember: the demo uses small amounts to avoid accidental large swaps

## More Info

- [Architecture](./ARCHITECTURE.md) - How it all works
- [Examples](./docs/EXAMPLES.md) - More workflow patterns
- [SDK Docs](./packages/sdk/README.md) - Full API reference
