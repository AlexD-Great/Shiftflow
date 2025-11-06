# @shiftflow/engine

Backend workflow execution engine for ShiftFlow.

## Features

- **Workflow Orchestration**: Monitor conditions and execute actions automatically
- **SideShift Integration**: Complete API lifecycle management
- **Price Oracle**: Real-time price monitoring via CoinGecko
- **State Management**: Track workflow and execution history
- **Error Handling**: Robust retry logic and error recovery

## Installation

```bash
npm install @shiftflow/engine
```

## Usage

```typescript
import { WorkflowEngine, ConditionType, ActionType } from '@shiftflow/engine';

const engine = new WorkflowEngine(
  process.env.SIDESHIFT_SECRET!,
  process.env.AFFILIATE_ID!,
  process.env.COINGECKO_API_KEY // optional
);

const workflow = {
  id: 'workflow-001',
  name: 'Price Alert',
  userId: 'user_123',
  condition: {
    type: ConditionType.PRICE_THRESHOLD,
    token: 'ETH',
    comparison: 'below',
    threshold: 3000,
    currency: 'USD',
  },
  actions: [{
    type: ActionType.CROSS_CHAIN_SWAP,
    depositCoin: 'eth',
    depositNetwork: 'arbitrum',
    settleCoin: 'btc',
    settleNetwork: 'bitcoin',
    amount: '0.1',
    settleAddress: 'bc1q...',
  }],
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  executionCount: 0,
};

engine.registerWorkflow(workflow);
engine.startMonitoring(30000); // Check every 30 seconds
```

## API Reference

### WorkflowEngine

#### Constructor

```typescript
new WorkflowEngine(
  sideshiftSecret: string,
  sideshiftAffiliateId: string,
  coingeckoApiKey?: string
)
```

#### Methods

**`registerWorkflow(workflow: Workflow): void`**

Register a workflow for monitoring.

**`startMonitoring(intervalMs?: number): void`**

Start monitoring all active workflows. Default: 30000ms (30 seconds).

**`stopMonitoring(): void`**

Stop monitoring workflows.

**`getWorkflow(id: string): Workflow | undefined`**

Get a workflow by ID.

**`getAllWorkflows(): Workflow[]`**

Get all registered workflows.

**`getWorkflowExecutions(workflowId: string): WorkflowExecution[]`**

Get execution history for a workflow.

### SideShiftService

Low-level SideShift API client.

```typescript
import { SideShiftService } from '@shiftflow/engine';

const sideshift = new SideShiftService(secret, affiliateId);

// Request a quote
const quote = await sideshift.requestQuote({
  depositCoin: 'eth',
  depositNetwork: 'arbitrum',
  settleCoin: 'btc',
  settleNetwork: 'bitcoin',
  depositAmount: '0.1',
});

// Create a shift
const shift = await sideshift.createFixedShift({
  quoteId: quote.id,
  settleAddress: 'bc1q...',
});

// Monitor shift status
const finalStatus = await sideshift.monitorShift(shift.id);
```

### PriceOracleService

Price monitoring service.

```typescript
import { PriceOracleService } from '@shiftflow/engine';

const oracle = new PriceOracleService(coingeckoApiKey);

// Get current price
const priceData = await oracle.getPrice('ETH', 'USD');
console.log(priceData.price); // 3245.67

// Check threshold
const result = await oracle.checkPriceThreshold('ETH', 'below', 3000, 'USD');
console.log(result.met); // false
console.log(result.currentPrice); // 3245.67
```

## Environment Variables

```env
SIDESHIFT_SECRET=your_private_key
AFFILIATE_ID=your_account_id
COINGECKO_API_KEY=optional_api_key
```

## Running the Demo

```bash
cd packages/engine
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## License

MIT
