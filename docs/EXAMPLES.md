# ShiftFlow Workflow Examples

## 1. DeFi Sniper: Price-Triggered Swap

Automatically execute a cross-chain swap when a price threshold is met.

```typescript
import { createWorkflow } from '@shiftflow/sdk';

const sniperWorkflow = createWorkflow()
  .id('defi-sniper-001')
  .name('ETH Price Drop Sniper')
  .description('Swap ETH to BTC when price drops below $3000')
  .userId('user_123')
  .whenPriceIs('ETH', 'below', 3000, 'USD')
  .thenSwap({
    amount: '0.5',
    fromCoin: 'eth',
    fromNetwork: 'arbitrum',
    toCoin: 'btc',
    toNetwork: 'bitcoin',
    toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  })
  .build();
```

**Use Case:** Automatically buy BTC when ETH dips, capturing arbitrage opportunities.

---

## 2. Treasury Rebalancing

Automatically rebalance portfolio based on market conditions.

```typescript
const rebalanceWorkflow = createWorkflow()
  .id('treasury-rebalance-001')
  .name('BTC Profit Taking')
  .description('Take profits when BTC hits $100k')
  .userId('dao_treasury')
  .whenPriceIs('BTC', 'above', 100000, 'USD')
  .thenSwap({
    amount: '0.25',
    fromCoin: 'btc',
    fromNetwork: 'bitcoin',
    toCoin: 'usdc',
    toNetwork: 'arbitrum',
    toAddress: '0xYourTreasuryAddress',
  })
  .build();
```

**Use Case:** DAOs can automate treasury management without manual intervention.

---

## 3. Dollar-Cost Averaging (DCA)

Gradually accumulate assets at different price points.

```typescript
const dcaWorkflow = createWorkflow()
  .id('dca-btc-001')
  .name('BTC DCA Strategy')
  .description('Buy BTC when price is favorable')
  .userId('user_456')
  .whenPriceIs('BTC', 'below', 95000, 'USD')
  .thenSwap({
    amount: '1000', // $1000 USDC
    fromCoin: 'usdc',
    fromNetwork: 'arbitrum',
    toCoin: 'btc',
    toNetwork: 'bitcoin',
    toAddress: 'bc1qYourAddress',
  })
  .build();
```

**Use Case:** Automated DCA strategy without manual monitoring.

---

## 4. Stop-Loss Protection

Protect your portfolio from downside risk.

```typescript
const stopLossWorkflow = createWorkflow()
  .id('stop-loss-001')
  .name('ETH Stop Loss')
  .description('Exit position if ETH drops below $2500')
  .userId('user_789')
  .whenPriceIs('ETH', 'below', 2500, 'USD')
  .thenSwap({
    amount: '5.0',
    fromCoin: 'eth',
    fromNetwork: 'mainnet',
    toCoin: 'usdc',
    toNetwork: 'arbitrum',
    toAddress: '0xYourSafeAddress',
  })
  .build();
```

**Use Case:** Automatic risk management for volatile positions.

---

## 5. Cross-Chain Arbitrage

Capture price differences across chains.

```typescript
const arbWorkflow = createWorkflow()
  .id('arb-001')
  .name('ETH Arbitrage Bot')
  .description('Arbitrage ETH between L1 and L2')
  .userId('arb_bot')
  .whenPriceIs('ETH', 'below', 3100, 'USD')
  .thenSwap({
    amount: '2.0',
    fromCoin: 'eth',
    fromNetwork: 'arbitrum',
    toCoin: 'eth',
    toNetwork: 'mainnet',
    toAddress: '0xYourL1Address',
  })
  .build();
```

**Use Case:** Automated arbitrage between different networks.

---

## 6. Gaming Token Cash-Out

Automatically convert gaming rewards to stablecoins.

```typescript
const gamingWorkflow = createWorkflow()
  .id('gaming-cashout-001')
  .name('Auto Cash-Out Gaming Tokens')
  .description('Convert game tokens to USDC automatically')
  .userId('gamer_123')
  .whenPriceIs('AVAX', 'above', 40, 'USD') // Example: when AVAX price is good
  .thenSwap({
    amount: '100',
    fromCoin: 'avax',
    fromNetwork: 'avalanche',
    toCoin: 'usdc',
    toNetwork: 'arbitrum',
    toAddress: '0xYourWallet',
  })
  .build();
```

**Use Case:** Seamless gaming economy integration with zero UI friction.

---

## 7. Multi-Action Workflow (Future)

Chain multiple actions together:

```typescript
// Coming soon: Multi-step workflows
const complexWorkflow = createWorkflow()
  .id('complex-001')
  .name('Multi-Step Strategy')
  .userId('power_user')
  .whenPriceIs('ETH', 'below', 2800, 'USD')
  .thenSwap({
    amount: '1.0',
    fromCoin: 'eth',
    fromNetwork: 'mainnet',
    toCoin: 'usdc',
    toNetwork: 'arbitrum',
    toAddress: '0xTemp',
  })
  .thenSwap({
    amount: '2800',
    fromCoin: 'usdc',
    fromNetwork: 'arbitrum',
    toCoin: 'btc',
    toNetwork: 'bitcoin',
    toAddress: 'bc1qFinal',
  })
  .build();
```

---

## Running Examples

### Option 1: Using the SDK

```typescript
import { ShiftFlowClient } from '@shiftflow/sdk';

const client = new ShiftFlowClient({
  sideshiftSecret: process.env.SIDESHIFT_SECRET!,
  sideshiftAffiliateId: process.env.AFFILIATE_ID!,
});

client.registerWorkflow(sniperWorkflow);
client.startMonitoring(30000); // Check every 30 seconds
```

### Option 2: Using the Web UI

1. Visit http://localhost:3000
2. Connect wallet
3. Click "Create from Template"
4. Select an example workflow
5. Customize parameters
6. Activate

---

## Best Practices

1. **Start Small**: Test with small amounts first
2. **Monitor Execution**: Check workflow execution history regularly
3. **Set Realistic Thresholds**: Don't set conditions that trigger too frequently
4. **Use Refund Addresses**: Always provide a refund address for failed swaps
5. **Consider Gas Costs**: Factor in transaction costs for your workflows

---

## Need Help?

- [API Reference](./API_REFERENCE.md)
- [Getting Started Guide](./GETTING_STARTED.md)
- [GitHub Issues](https://github.com/yourrepo/issues)
