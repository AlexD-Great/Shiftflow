# ShiftFlow - Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **Git** installed
- ✅ **SideShift.ai account** ([Create one](https://sideshift.ai/account))
- ✅ **Code editor** (VS Code recommended)

## Step-by-Step Installation

### 1. Get SideShift Credentials

1. Visit https://sideshift.ai/account
2. Your account is created automatically when you visit
3. **Copy your Private Key** (keep this secret!)
4. **Copy your Account ID**

### 2. Clone/Download the Project

If you have the project locally, navigate to it:
```bash
cd C:\Users\SADAM\OneDrive\Adam\OneDrive\Documents\shiftflow
```

### 3. Install Dependencies

#### Option A: Automated Setup (Windows)
```powershell
.\setup.ps1
```

#### Option B: Manual Setup
```bash
# Install root dependencies
npm install

# Install engine dependencies
cd packages/engine
npm install
cd ../..

# Install SDK dependencies
cd packages/sdk
npm install
cd ../..
```

### 4. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
notepad .env  # Windows
# or
nano .env     # Linux/Mac
```

Add your credentials:
```env
SIDESHIFT_SECRET=your_private_key_here
AFFILIATE_ID=your_account_id_here
COINGECKO_API_KEY=  # Optional
DEMO_SETTLE_ADDRESS=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
```

Also configure the engine package:
```bash
cd packages/engine
cp .env.example .env
notepad .env  # Add same credentials
cd ../..
```

### 5. Verify Installation

Run the demo to verify everything works:

```bash
cd packages/engine
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

[WorkflowEngine] Registered workflow: workflow_defi_sniper_001 - DeFi Sniper: ETH Price Drop
[WorkflowEngine] Starting workflow monitoring (interval: 30000ms)
[WorkflowEngine] Checking 1 active workflows
[WorkflowEngine] Price check: ETH = $3245.67 (threshold: below $3000) - NOT MET
```

**Success!** If you see this, everything is working correctly.

## Troubleshooting

### Error: "Cannot find module"

**Solution**: Install dependencies
```bash
npm install
cd packages/engine && npm install
cd ../sdk && npm install
```

### Error: "Invalid SideShift credentials"

**Solution**: Check your `.env` file
- Ensure `SIDESHIFT_SECRET` is correct (no extra spaces)
- Ensure `AFFILIATE_ID` is correct
- Get fresh credentials from https://sideshift.ai/account

### Error: "ENOENT: no such file or directory"

**Solution**: Make sure you're in the correct directory
```bash
cd C:\Users\SADAM\OneDrive\Adam\OneDrive\Documents\shiftflow
```

### Error: "Price oracle not working"

**Solution**: CoinGecko rate limits
- Free tier has limits (10-50 calls/min)
- Add `COINGECKO_API_KEY` to `.env` for better limits
- Get API key from https://www.coingecko.com/en/api

### TypeScript Errors in IDE

**Solution**: These are expected until dependencies are installed
```bash
npm install
```

The errors will disappear after installation.

## Project Structure Verification

After installation, you should have:

```
shiftflow/
├── node_modules/              ✅ Root dependencies
├── packages/
│   ├── engine/
│   │   ├── node_modules/      ✅ Engine dependencies
│   │   ├── src/               ✅ Source code
│   │   └── .env               ✅ Your credentials
│   └── sdk/
│       ├── node_modules/      ✅ SDK dependencies
│       └── src/               ✅ Source code
├── docs/                      ✅ Documentation
├── .env                       ✅ Your credentials
└── [config files]             ✅ Configuration
```

## Testing Your Installation

### Test 1: Run the Demo

```bash
cd packages/engine
npm run dev
```

Expected: Price monitoring starts, no errors.

### Test 2: Check Price Oracle

Modify `packages/engine/src/demo.ts` temporarily:

```typescript
// Change threshold to trigger immediately
threshold: 999999,  // Very high, will always trigger
```

Run again:
```bash
npm run dev
```

Expected: Workflow should trigger and attempt to execute.

**⚠️ Warning**: This will create a real SideShift quote! Change it back after testing.

### Test 3: Build SDK

```bash
cd packages/sdk
npm run build
```

Expected: No errors, `dist/` folder created.

## Next Steps

### 1. Customize the Demo

Edit `packages/engine/src/demo.ts`:
- Change the token (BTC, USDC, etc.)
- Change the threshold
- Change the swap amounts
- Change the destination address

### 2. Create Your Own Workflow

Create a new file `my-workflow.ts`:

```typescript
import { ShiftFlowClient, createWorkflow } from '@shiftflow/sdk';

const client = new ShiftFlowClient({
  sideshiftSecret: process.env.SIDESHIFT_SECRET!,
  sideshiftAffiliateId: process.env.AFFILIATE_ID!,
});

const workflow = createWorkflow()
  .id('my-custom-workflow')
  .name('My Custom Workflow')
  .userId('my_user')
  .whenPriceIs('BTC', 'above', 95000, 'USD')
  .thenSwap({
    amount: '0.001',
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
npx tsx my-workflow.ts
```

### 3. Explore the Documentation

- [Quick Start](./QUICKSTART.md) - 5-minute guide
- [Examples](./docs/EXAMPLES.md) - Workflow examples
- [Architecture](./ARCHITECTURE.md) - Technical details
- [API Reference](./packages/engine/README.md) - API docs

## Development Workflow

### Running in Development Mode

```bash
# Terminal 1: Run engine
cd packages/engine
npm run dev

# Terminal 2: Run SDK tests (future)
cd packages/sdk
npm test

# Terminal 3: Run frontend (future)
cd packages/web
npm run dev
```

### Building for Production

```bash
# Build all packages
npm run build

# Or build individually
cd packages/engine && npm run build
cd packages/sdk && npm run build
```

## Getting Help

If you encounter issues:

1. **Check the documentation**: Most common issues are covered
2. **Review error messages**: They usually indicate the problem
3. **Check environment variables**: Ensure `.env` is configured correctly
4. **Verify Node version**: Must be 18+
5. **Open an issue**: If all else fails, create a GitHub issue

## Security Notes

⚠️ **Never commit your `.env` file to Git!**

The `.gitignore` file is configured to exclude it, but always verify:

```bash
git status
# Should NOT show .env file
```

⚠️ **Keep your SideShift Private Key secret!**

- Don't share it
- Don't commit it
- Don't expose it in logs
- Regenerate if compromised

## Success Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] `.env` file created and configured
- [ ] SideShift credentials added
- [ ] Demo runs without errors
- [ ] Price monitoring works
- [ ] No TypeScript errors in IDE

## You're Ready! 🎉

Your ShiftFlow installation is complete. Start building workflows and automating your DeFi operations!

**Next**: Read [QUICKSTART.md](./QUICKSTART.md) for usage examples.
