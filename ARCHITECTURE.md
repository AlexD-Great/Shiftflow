# ShiftFlow Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         ShiftFlow Platform                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐        ┌──────────────┐        ┌──────────────┐
│   Frontend    │        │   Backend    │        │     SDK      │
│   (Next.js)   │◄──────►│   (Node.js)  │◄──────►│ (TypeScript) │
└───────────────┘        └──────────────┘        └──────────────┘
        │                        │                        │
        │                        ▼                        │
        │                ┌──────────────┐                │
        │                │   Workflow   │                │
        │                │    Engine    │                │
        │                └──────────────┘                │
        │                        │                        │
        │          ┌─────────────┼─────────────┐         │
        │          ▼             ▼             ▼         │
        │   ┌──────────┐  ┌──────────┐  ┌──────────┐   │
        │   │  Price   │  │SideShift │  │  State   │   │
        │   │  Oracle  │  │   API    │  │ Machine  │   │
        │   └──────────┘  └──────────┘  └──────────┘   │
        │          │             │             │         │
        └──────────┼─────────────┼─────────────┼─────────┘
                   │             │             │
                   ▼             ▼             ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │CoinGecko │  │SideShift │  │  Memory  │
            │   API    │  │   API    │  │  Store   │
            └──────────┘  └──────────┘  └──────────┘
```

## Core Components

### 1. Workflow Engine (`packages/engine`)

**Purpose**: Core execution layer that monitors conditions and triggers actions.

**Key Files**:
- `services/workflow-engine.ts` - Main orchestration logic
- `services/sideshift.ts` - SideShift API client
- `services/price-oracle.ts` - Price monitoring
- `types/index.ts` - TypeScript definitions

**Flow**:
```
1. Register Workflow
   ↓
2. Start Monitoring (polling loop)
   ↓
3. Check Condition (every N seconds)
   ↓
4. If Met → Execute Actions
   ↓
5. Log Execution History
```

**State Machine**:
```
Workflow States:
- active: Currently being monitored
- paused: Temporarily disabled
- completed: Successfully executed
- failed: Execution error

Execution States:
- pending: Queued for execution
- executing: Currently running
- completed: Successfully finished
- failed: Error occurred
```

### 2. SideShift Integration

**API Lifecycle**:
```
1. Request Quote
   POST /v2/quotes
   {
     depositCoin, depositNetwork,
     settleCoin, settleNetwork,
     depositAmount, affiliateId
   }
   ↓
2. Create Fixed Shift
   POST /v2/shifts/fixed
   {
     quoteId, settleAddress, affiliateId
   }
   ↓
3. Monitor Shift Status
   GET /v2/shifts/{shiftId}
   Poll until status = 'settled' or 'refunded'
```

**Error Handling**:
- Quote expiration (5 minutes)
- Network failures (retry with exponential backoff)
- Invalid addresses (validation before submission)
- Insufficient liquidity (fallback to alternative routes)

### 3. Price Oracle

**Data Sources**:
- Primary: CoinGecko API (free tier: 10-50 calls/min)
- Fallback: (Future) Chainlink Price Feeds

**Token Mapping**:
```typescript
{
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDC': 'usd-coin',
  // ... etc
}
```

**Caching Strategy**:
- Cache prices for 30 seconds
- Reduce API calls
- Improve response time

### 4. SDK (`packages/sdk`)

**Design Philosophy**:
- **Fluent API**: Chainable methods for readability
- **Type Safety**: Full TypeScript support
- **Zero Config**: Works out of the box

**Example Usage**:
```typescript
const workflow = createWorkflow()
  .id('my-workflow')
  .name('My Workflow')
  .userId('user_123')
  .whenPriceIs('ETH', 'below', 3000)
  .thenSwap({ /* ... */ })
  .build();
```

**Builder Pattern Benefits**:
- Prevents invalid configurations
- Clear error messages
- IDE autocomplete support

### 5. Frontend (`packages/web`)

**Tech Stack**:
- Next.js 14 (App Router)
- TailwindCSS (styling)
- shadcn/ui (components)
- RainbowKit (wallet connection)
- Wagmi (Web3 hooks)

**Pages**:
- `/` - Landing page
- `/workflows` - Workflow list
- `/workflows/new` - Workflow builder
- `/workflows/[id]` - Workflow detail
- `/executions` - Execution history

**State Management**:
- React Context for global state
- SWR for data fetching
- Local storage for persistence

## Data Flow

### Workflow Creation

```
User Input (Frontend)
  ↓
Validation (Frontend)
  ↓
API Call (Backend)
  ↓
Store in Memory (Engine)
  ↓
Start Monitoring (Engine)
```

### Workflow Execution

```
Condition Check (Engine)
  ↓
Price Oracle Query
  ↓
Condition Met? → Yes
  ↓
Create Execution Record
  ↓
Request SideShift Quote
  ↓
Create Fixed Shift
  ↓
Monitor Shift Status
  ↓
Update Execution Record
  ↓
Notify User (Future: Webhooks)
```

## Security Considerations

### 1. API Key Management
- **Never expose** `SIDESHIFT_SECRET` to frontend
- Store in environment variables
- Use separate keys for dev/prod

### 2. Wallet Security
- Non-custodial design
- Users control their own keys
- Workflows only trigger swaps, don't hold funds

### 3. Rate Limiting
- Implement per-user limits
- Prevent abuse of price oracle
- Queue execution requests

### 4. Input Validation
- Validate all addresses
- Check amount limits
- Sanitize user inputs

## Scalability

### Current Limitations
- In-memory storage (workflows lost on restart)
- Single-threaded execution
- No horizontal scaling

### Future Improvements

**Phase 1: Persistence**
```
Replace in-memory Map with:
- PostgreSQL for workflows
- Redis for execution state
- MongoDB for logs
```

**Phase 2: Queue System**
```
Add message queue:
- RabbitMQ or Redis Queue
- Separate workers for execution
- Retry failed jobs
```

**Phase 3: Microservices**
```
Split into services:
- Condition Monitor Service
- Execution Service
- Price Oracle Service
- API Gateway
```

## Performance Optimization

### 1. Caching
- Price data (30s TTL)
- SideShift coin list (1h TTL)
- User workflows (in-memory)

### 2. Batching
- Batch price checks for multiple workflows
- Single API call for multiple tokens
- Reduce network overhead

### 3. Parallel Execution
- Check conditions in parallel
- Use Promise.all() for independent operations
- Worker threads for CPU-intensive tasks

## Monitoring & Observability

### Metrics to Track
- Workflow execution count
- Success/failure rate
- Average execution time
- API call latency
- Error rates by type

### Logging Strategy
```
Levels:
- ERROR: Failed executions, API errors
- WARN: Retries, near-limits
- INFO: Workflow lifecycle events
- DEBUG: Detailed execution steps
```

### Future: Observability Stack
- Prometheus (metrics)
- Grafana (dashboards)
- Sentry (error tracking)
- DataDog (APM)

## Testing Strategy

### Unit Tests
- SideShift API client
- Price oracle logic
- Workflow builder validation

### Integration Tests
- Full workflow execution
- API integration
- Database operations

### E2E Tests
- Frontend user flows
- Complete workflow lifecycle
- Error scenarios

## Deployment

### Development
```bash
npm run dev  # All packages in watch mode
```

### Production
```bash
npm run build  # Build all packages
npm start      # Start production server
```

### Docker (Future)
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
# ... build steps

FROM node:18-alpine
# ... runtime
```

## API Endpoints (Future)

```
POST   /api/workflows          # Create workflow
GET    /api/workflows          # List workflows
GET    /api/workflows/:id      # Get workflow
PUT    /api/workflows/:id      # Update workflow
DELETE /api/workflows/:id      # Delete workflow
POST   /api/workflows/:id/pause   # Pause workflow
POST   /api/workflows/:id/resume  # Resume workflow

GET    /api/executions         # List executions
GET    /api/executions/:id     # Get execution

GET    /api/prices/:token      # Get current price
GET    /api/coins              # List supported coins
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT
