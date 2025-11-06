# @shiftflow/sdk

TypeScript SDK for ShiftFlow - Conditional execution layer for cross-chain DeFi.

## Installation

```bash
npm install @shiftflow/sdk
```

## Quick Start

```typescript
import { ShiftFlowClient, createWorkflow } from '@shiftflow/sdk';

// Initialize client
const client = new ShiftFlowClient({
  sideshiftSecret: process.env.SIDESHIFT_SECRET!,
  sideshiftAffiliateId: process.env.AFFILIATE_ID!,
});

// Create a workflow using the builder
const workflow = createWorkflow()
  .id('my-workflow-001')
  .name('ETH Price Drop Alert')
  .description('Swap ETH to BTC when price drops below $3000')
  .userId('user_123')
  .whenPriceIs('ETH', 'below', 3000, 'USD')
  .thenSwap({
    amount: '0.1',
    fromCoin: 'eth',
    fromNetwork: 'arbitrum',
    toCoin: 'btc',
    toNetwork: 'bitcoin',
    toAddress: 'bc1q...',
  })
  .build();

// Register and start monitoring
client.registerWorkflow(workflow);
client.startMonitoring();
```

## API Reference

### ShiftFlowClient

Main client for interacting with ShiftFlow.

#### Constructor

```typescript
new ShiftFlowClient(config: ShiftFlowConfig)
```

**Config:**
- `sideshiftSecret` - Your SideShift private key
- `sideshiftAffiliateId` - Your SideShift account ID
- `coingeckoApiKey` (optional) - CoinGecko API key for better rate limits

#### Methods

**`registerWorkflow(workflow: Workflow): void`**
Register a workflow for execution.

**`startMonitoring(intervalMs?: number): void`**
Start monitoring all registered workflows. Default interval: 30 seconds.

**`stopMonitoring(): void`**
Stop monitoring workflows.

**`getWorkflow(id: string): Workflow | undefined`**
Get a workflow by ID.

**`getAllWorkflows(): Workflow[]`**
Get all registered workflows.

**`getWorkflowExecutions(workflowId: string): WorkflowExecution[]`**
Get execution history for a workflow.

### WorkflowBuilder

Fluent API for building workflows.

```typescript
const workflow = createWorkflow()
  .id('workflow-id')
  .name('Workflow Name')
  .description('Description')
  .userId('user-id')
  .whenPriceIs('ETH', 'below', 3000)
  .thenSwap({
    amount: '0.1',
    fromCoin: 'eth',
    fromNetwork: 'arbitrum',
    toCoin: 'btc',
    toNetwork: 'bitcoin',
    toAddress: 'bc1q...',
  })
  .build();
```

## Examples

### DeFi Sniper

Automatically detect high-yield opportunities and execute cross-chain swaps:

```typescript
const sniperWorkflow = createWorkflow()
  .id('defi-sniper-001')
  .name('High Yield Sniper')
  .description('Swap to stablecoin when APR > 25%')
  .userId('user_123')
  .whenPriceIs('ETH', 'below', 2800)
  .thenSwap({
    amount: '1.0',
    fromCoin: 'eth',
    fromNetwork: 'mainnet',
    toCoin: 'usdc',
    toNetwork: 'arbitrum',
    toAddress: '0x...',
  })
  .build();
```

### Treasury Rebalancing

Automatically rebalance portfolio based on price movements:

```typescript
const rebalanceWorkflow = createWorkflow()
  .id('treasury-rebalance-001')
  .name('Auto Rebalance')
  .description('Rebalance when BTC dominance changes')
  .userId('dao_treasury')
  .whenPriceIs('BTC', 'above', 100000)
  .thenSwap({
    amount: '0.5',
    fromCoin: 'btc',
    fromNetwork: 'bitcoin',
    toCoin: 'eth',
    toNetwork: 'mainnet',
    toAddress: '0x...',
  })
  .build();
```

## Types

All TypeScript types are exported from the SDK:

```typescript
import {
  Workflow,
  WorkflowCondition,
  WorkflowAction,
  WorkflowExecution,
  ConditionType,
  ActionType,
} from '@shiftflow/sdk';
```

## License

MIT
