# ShiftFlow Wave 3 - Complete Database Schema

This document contains the complete Prisma schema for ShiftFlow Wave 3, including all models, relations, and indexes.

---

## Prisma Schema

**File: `packages/web/prisma/schema.prisma`**

```prisma
// Prisma Schema for ShiftFlow Wave 3
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  emailVerified DateTime?
  name          String?
  image         String?
  
  // Wallet addresses (non-custodial)
  walletAddress String?   @unique
  
  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  workflows     Workflow[]
  executions    Execution[]
  apiKeys       ApiKey[]
  
  @@index([email])
  @@index([walletAddress])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// API KEY MANAGEMENT
// ============================================

model ApiKey {
  id          String   @id @default(cuid())
  userId      String
  name        String
  key         String   @unique // Hashed
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([key])
}

// ============================================
// WORKFLOW MANAGEMENT
// ============================================

enum WorkflowStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  FAILED
  ARCHIVED
}

model Workflow {
  id              String         @id @default(cuid())
  userId          String
  
  // Workflow metadata
  name            String
  description     String?
  status          WorkflowStatus @default(DRAFT)
  
  // Workflow configuration (JSON)
  conditions      Json           // Array of condition objects
  actions         Json           // Array of action objects
  
  // Execution settings
  maxExecutions   Int?           // Limit number of executions
  executionCount  Int            @default(0)
  
  // Safe integration (optional)
  safeAddress     String?
  safeNetwork     String?
  
  // Timestamps
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  lastExecutedAt  DateTime?
  
  // Relations
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  executions      Execution[]
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

// ============================================
// EXECUTION TRACKING
// ============================================

enum ExecutionStatus {
  PENDING
  CHECKING_CONDITIONS
  CONDITIONS_MET
  EXECUTING
  COMPLETED
  FAILED
  CANCELLED
}

model Execution {
  id              String          @id @default(cuid())
  workflowId      String
  userId          String
  
  // Execution details
  status          ExecutionStatus @default(PENDING)
  
  // Condition results
  conditionsMet   Boolean         @default(false)
  conditionData   Json?           // Snapshot of conditions when checked
  
  // Action results
  actionResults   Json?           // Results from each action
  
  // SideShift integration
  sideShiftQuoteId String?
  sideShiftShiftId String?
  sideShiftStatus  String?
  
  // Transaction details
  txHash          String?
  txStatus        String?
  
  // Error handling
  error           String?         @db.Text
  errorStack      String?         @db.Text
  retryCount      Int             @default(0)
  
  // Timestamps
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  completedAt     DateTime?
  
  // Relations
  workflow        Workflow        @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  logs            ExecutionLog[]
  
  @@index([workflowId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

// ============================================
// EXECUTION LOGS
// ============================================

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
}

model ExecutionLog {
  id          String      @id @default(cuid())
  executionId String
  
  level       LogLevel    @default(INFO)
  message     String      @db.Text
  data        Json?
  
  createdAt   DateTime    @default(now())
  
  execution   Execution   @relation(fields: [executionId], references: [id], onDelete: Cascade)
  
  @@index([executionId])
  @@index([createdAt])
  @@index([level])
}

// ============================================
// PRICE CACHE (for performance)
// ============================================

model PriceCache {
  id          String   @id @default(cuid())
  coinId      String   // CoinGecko ID
  symbol      String
  price       Float
  change24h   Float?
  
  updatedAt   DateTime @updatedAt
  
  @@unique([coinId])
  @@index([symbol])
  @@index([updatedAt])
}

// ============================================
// USER FEEDBACK & TESTING
// ============================================

model BetaTester {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  walletAddress   String?
  
  // Testing metrics
  workflowsCreated Int     @default(0)
  executionsRun    Int     @default(0)
  
  // Feedback
  feedback        String?  @db.Text
  rating          Int?     // 1-5
  
  // Status
  invitedAt       DateTime @default(now())
  joinedAt        DateTime?
  lastActiveAt    DateTime?
  
  @@index([email])
  @@index([walletAddress])
}

// ============================================
// NOTIFICATIONS
// ============================================

enum NotificationType {
  WORKFLOW_EXECUTED
  WORKFLOW_FAILED
  CONDITION_MET
  SYSTEM_ALERT
}

model Notification {
  id          String           @id @default(cuid())
  userId      String
  
  type        NotificationType
  title       String
  message     String           @db.Text
  data        Json?
  
  read        Boolean          @default(false)
  
  createdAt   DateTime         @default(now())
  
  @@index([userId])
  @@index([read])
  @@index([createdAt])
}

// ============================================
// ANALYTICS & METRICS
// ============================================

model WorkflowMetrics {
  id                String   @id @default(cuid())
  workflowId        String
  
  // Execution metrics
  totalExecutions   Int      @default(0)
  successfulExecs   Int      @default(0)
  failedExecs       Int      @default(0)
  
  // Performance metrics
  avgExecutionTime  Float?   // in seconds
  lastExecutionTime Float?   // in seconds
  
  // Financial metrics
  totalVolume       Float?   // in USD
  totalFees         Float?   // in USD
  
  // Timestamps
  updatedAt         DateTime @updatedAt
  
  @@unique([workflowId])
  @@index([updatedAt])
}

// ============================================
// SIDESHIFT INTEGRATION TRACKING
// ============================================

model SideShiftOrder {
  id              String   @id @default(cuid())
  executionId     String?
  userId          String
  
  // SideShift data
  quoteId         String?
  shiftId         String   @unique
  status          String
  
  // Order details
  depositCoin     String
  depositNetwork  String
  depositAmount   String
  depositAddress  String?
  
  settleCoin      String
  settleNetwork   String
  settleAmount    String
  settleAddress   String
  
  // Transaction hashes
  depositHash     String?
  settleHash      String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  expiresAt       DateTime?
  completedAt     DateTime?
  
  @@index([userId])
  @@index([shiftId])
  @@index([status])
  @@index([createdAt])
}
```

---

## Database Setup Instructions

### 1. Install Prisma

```bash
cd packages/web
npm install prisma @prisma/client
npm install -D prisma
```

### 2. Initialize Prisma

```bash
npx prisma init
```

### 3. Configure Database URL

Edit `.env`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/shiftflow"
```

For Vercel Postgres:
```bash
DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"
```

### 4. Create Migration

```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Seed Database (Optional)

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      walletAddress: '0x1234567890123456789012345678901234567890',
      name: 'Test User',
    },
  });

  console.log('Created test user:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx prisma db seed
```

---

## Prisma Client Usage

### Initialize Client

**File: `packages/web/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Example Queries

**Create Workflow:**
```typescript
const workflow = await prisma.workflow.create({
  data: {
    userId: user.id,
    name: 'DCA Strategy',
    description: 'Dollar cost averaging',
    status: 'ACTIVE',
    conditions: [
      {
        type: 'price_threshold',
        coinId: 'ethereum',
        operator: 'below',
        value: 3000,
      },
    ],
    actions: [
      {
        type: 'sideshift_swap',
        depositCoin: 'eth',
        settleCoin: 'btc',
        amount: '0.1',
      },
    ],
  },
});
```

**Query Workflows:**
```typescript
const workflows = await prisma.workflow.findMany({
  where: {
    userId: user.id,
    status: 'ACTIVE',
  },
  include: {
    executions: {
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
});
```

**Create Execution:**
```typescript
const execution = await prisma.execution.create({
  data: {
    workflowId: workflow.id,
    userId: user.id,
    status: 'CHECKING_CONDITIONS',
    conditionsMet: true,
    conditionData: workflow.conditions,
  },
});
```

**Update Execution:**
```typescript
await prisma.execution.update({
  where: { id: execution.id },
  data: {
    status: 'COMPLETED',
    completedAt: new Date(),
    actionResults: {
      shiftId: 'abc123',
      status: 'settled',
    },
  },
});
```

---

## Database Indexes

Indexes are optimized for:
- User lookups by wallet address
- Workflow queries by user and status
- Execution queries by workflow and status
- Time-based queries (createdAt, updatedAt)
- Log queries by execution

---

## Data Migration Strategy

### From Wave 2 to Wave 3

If you have existing data in localStorage:

1. **Export from localStorage:**
```typescript
const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
```

2. **Import to database:**
```typescript
for (const workflow of workflows) {
  await prisma.workflow.create({
    data: {
      userId: currentUser.id,
      name: workflow.name,
      description: workflow.description,
      conditions: workflow.conditions,
      actions: workflow.actions,
      status: 'DRAFT',
    },
  });
}
```

---

## Backup & Recovery

### Backup Database

```bash
# Using pg_dump
pg_dump $DATABASE_URL > backup.sql

# Using Prisma
npx prisma db pull
```

### Restore Database

```bash
# Using psql
psql $DATABASE_URL < backup.sql

# Using Prisma
npx prisma db push
```

---

## Performance Optimization

### Query Optimization

1. **Use indexes** - Already defined in schema
2. **Select only needed fields:**
```typescript
const workflows = await prisma.workflow.findMany({
  select: {
    id: true,
    name: true,
    status: true,
  },
});
```

3. **Use pagination:**
```typescript
const workflows = await prisma.workflow.findMany({
  take: 20,
  skip: page * 20,
});
```

4. **Use connection pooling** - Enabled by default in Vercel Postgres

### Caching Strategy

- Price data cached for 60 seconds
- User sessions cached in memory
- Workflow data invalidated on update

---

## Monitoring & Maintenance

### Prisma Studio

View and edit data:
```bash
npx prisma studio
```

### Database Metrics

Monitor:
- Query performance
- Connection pool usage
- Table sizes
- Index usage

### Regular Maintenance

- Vacuum database weekly
- Analyze query performance
- Archive old executions
- Clean up expired sessions

---

This schema provides a solid foundation for ShiftFlow Wave 3, supporting all required features while maintaining performance and scalability.
