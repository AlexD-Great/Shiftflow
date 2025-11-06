# ShiftFlow - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies

```bash
cd shiftflow
npm install
```

### Step 2: Get SideShift Credentials

1. Visit https://sideshift.ai/account
2. Your account is created automatically
3. Copy your **Private Key** and **Account ID**

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
SIDESHIFT_SECRET=your_private_key_here
AFFILIATE_ID=your_account_id_here
```

### Step 4: Run the Demo

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

## 📦 What You Built

- ✅ **Backend Engine**: Monitors conditions and executes workflows
- ✅ **SideShift Integration**: Full API lifecycle (quote → shift → monitor)
- ✅ **Price Oracle**: Real-time price monitoring via CoinGecko
- ✅ **SDK**: Clean TypeScript API for developers
- ✅ **Demo Workflow**: Working example you can customize

## 🎯 Next Steps

### Customize the Demo Workflow

Edit `packages/engine/src/demo.ts`:

```typescript
const demoWorkflow: Workflow = {
  // ... existing config
  condition: {
    type: ConditionType.PRICE_THRESHOLD,
    token: 'BTC',  // Change token
    comparison: 'above',  // Change direction
    threshold: 95000,  // Change price
    currency: 'USD',
  },
  actions: [
    {
      type: ActionType.CROSS_CHAIN_SWAP,
      depositCoin: 'btc',  // Change from coin
      depositNetwork: 'bitcoin',
      settleCoin: 'usdc',  // Change to coin
      settleNetwork: 'arbitrum',
      amount: '0.005',  // Change amount
      settleAddress: 'YOUR_ADDRESS_HERE',  // Your address!
    },
  ],
};
```

### Build a Frontend (Optional)

```bash
cd packages/web
npm install
npm run dev
```

Visit http://localhost:3000

### Deploy to Production

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for production setup.

## 🔍 Troubleshooting

**Error: "Cannot find module"**
```bash
# Run in root directory
npm install
```

**Error: "Invalid credentials"**
- Double-check `.env` file
- Ensure no extra spaces in values
- Get fresh credentials from https://sideshift.ai/account

**Price checks not working**
- Free CoinGecko API has rate limits
- Add `COINGECKO_API_KEY` to `.env` for better limits

**Workflow not triggering**
- Check if condition is actually met (look at console logs)
- Verify price threshold is realistic
- Try changing comparison direction for testing

## 📚 Learn More

- [Full Documentation](./README.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Workflow Examples](./docs/EXAMPLES.md)
- [SideShift API Docs](https://docs.sideshift.ai/)

## 💡 Pro Tips

1. **Start with high/low thresholds** that won't trigger immediately
2. **Use small amounts** for testing (0.001 BTC, 0.01 ETH)
3. **Monitor the logs** to understand execution flow
4. **Test conditions** by temporarily changing thresholds

## 🎉 You're Ready!

You now have a working conditional execution layer for cross-chain DeFi. Start building your own workflows!

**Need help?** Open an issue on GitHub or check the docs.
