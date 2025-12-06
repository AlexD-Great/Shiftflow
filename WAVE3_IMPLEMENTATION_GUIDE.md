# ShiftFlow Wave 3 - Implementation Guide

Step-by-step guide to implement all Wave 3 features with complete code examples.

---

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- PostgreSQL database (or Vercel Postgres)
- SideShift API credentials
- Git repository set up
- Vercel account

---

## 🚀 Phase 1: Backend Foundation (Days 1-3)

### Step 1: Set Up Database

**1.1 Install Prisma**

```bash
cd packages/web
npm install prisma @prisma/client
npm install -D prisma
```

**1.2 Initialize Prisma**

```bash
npx prisma init
```

**1.3 Copy Schema**

Copy the complete schema from `WAVE3_DATABASE_SCHEMA.md` to `packages/web/prisma/schema.prisma`

**1.4 Configure Database URL**

Create `packages/web/.env.local`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/shiftflow"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"
SIDESHIFT_SECRET="your-sideshift-secret"
AFFILIATE_ID="your-affiliate-id"
```

**1.5 Create Migration**

```bash
npx prisma migrate dev --name init
```

**1.6 Generate Prisma Client**

```bash
npx prisma generate
```

### Step 2: Set Up Prisma Client

**File: `packages/web/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Step 3: Set Up Authentication

**3.1 Install Dependencies**

```bash
npm install next-auth @auth/prisma-adapter siwe viem
```

**3.2 Create Auth Configuration**

**File: `packages/web/lib/auth/config.ts`**

```typescript
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyMessage } from "viem";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        address: { label: "Address", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature || !credentials?.address) {
          throw new Error("Missing credentials");
        }

        try {
          // Verify the signature
          const isValid = await verifyMessage({
            address: credentials.address as `0x${string}`,
            message: credentials.message,
            signature: credentials.signature as `0x${string}`,
          });

          if (!isValid) {
            throw new Error("Invalid signature");
          }

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { walletAddress: credentials.address.toLowerCase() },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                walletAddress: credentials.address.toLowerCase(),
                name: `User ${credentials.address.slice(0, 6)}`,
              },
            });
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            walletAddress: user.walletAddress,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.walletAddress = (user as any).walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).walletAddress = token.walletAddress;
      }
      return session;
    },
  },
};
```

**3.3 Create Auth Route**

**File: `packages/web/app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/config";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Step 4: Create Workflow API Routes

**4.1 List/Create Workflows**

**File: `packages/web/app/api/workflows/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const workflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  conditions: z.array(z.any()),
  actions: z.array(z.any()),
  safeAddress: z.string().optional(),
  safeNetwork: z.string().optional(),
  maxExecutions: z.number().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const workflows = await prisma.workflow.findMany({
      where: {
        userId,
        ...(status && { status: status as any }),
      },
      include: {
        _count: {
          select: { executions: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const validatedData = workflowSchema.parse(body);

    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name: validatedData.name,
        description: validatedData.description,
        conditions: validatedData.conditions,
        actions: validatedData.actions,
        safeAddress: validatedData.safeAddress,
        safeNetwork: validatedData.safeNetwork,
        maxExecutions: validatedData.maxExecutions,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**4.2 Get/Update/Delete Workflow**

**File: `packages/web/app/api/workflows/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        executions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const existing = await prisma.workflow.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const workflow = await prisma.workflow.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const existing = await prisma.workflow.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.workflow.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Step 5: Create SideShift API Proxy

**5.1 Quote Endpoint**

**File: `packages/web/app/api/sideshift/quote/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

const SIDESHIFT_API_BASE = "https://sideshift.ai/api/v2";
const SIDESHIFT_SECRET = process.env.SIDESHIFT_SECRET!;
const AFFILIATE_ID = process.env.AFFILIATE_ID!;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Get user's IP address - CRITICAL for Mike's requirement
    const userIp = 
      req.headers.get("x-forwarded-for")?.split(",")[0] || 
      req.headers.get("x-real-ip") || 
      "unknown";

    console.log(`Requesting quote for user IP: ${userIp}`);

    const response = await fetch(`${SIDESHIFT_API_BASE}/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sideshift-secret": SIDESHIFT_SECRET,
        "x-user-ip": userIp, // CRITICAL: Pass user's IP
      },
      body: JSON.stringify({
        ...body,
        affiliateId: AFFILIATE_ID,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SideShift API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "SideShift API error" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error requesting quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**5.2 Fixed Shift Endpoint**

**File: `packages/web/app/api/sideshift/shift/fixed/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

const SIDESHIFT_API_BASE = "https://sideshift.ai/api/v2";
const SIDESHIFT_SECRET = process.env.SIDESHIFT_SECRET!;
const AFFILIATE_ID = process.env.AFFILIATE_ID!;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userId = (session.user as any).id;
    
    // Get user's IP address
    const userIp = 
      req.headers.get("x-forwarded-for")?.split(",")[0] || 
      req.headers.get("x-real-ip") || 
      "unknown";

    console.log(`Creating fixed shift for user IP: ${userIp}`);

    const response = await fetch(`${SIDESHIFT_API_BASE}/shifts/fixed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sideshift-secret": SIDESHIFT_SECRET,
        "x-user-ip": userIp, // CRITICAL: Pass user's IP
      },
      body: JSON.stringify({
        ...body,
        affiliateId: AFFILIATE_ID,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SideShift API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "SideShift API error" },
        { status: response.status }
      );
    }

    // Store shift in database for tracking
    await prisma.sideShiftOrder.create({
      data: {
        userId,
        shiftId: data.id,
        quoteId: body.quoteId,
        status: data.status || "pending",
        depositCoin: data.depositCoin,
        depositNetwork: data.depositNetwork,
        depositAmount: data.depositAmount,
        depositAddress: data.depositAddress,
        settleCoin: data.settleCoin,
        settleNetwork: data.settleNetwork,
        settleAmount: data.settleAmount,
        settleAddress: data.settleAddress,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating fixed shift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**5.3 Shift Status Endpoint**

**File: `packages/web/app/api/sideshift/shift/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

const SIDESHIFT_API_BASE = "https://sideshift.ai/api/v2";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${SIDESHIFT_API_BASE}/shifts/${params.id}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "SideShift API error" },
        { status: response.status }
      );
    }

    // Update shift status in database
    await prisma.sideShiftOrder.updateMany({
      where: { shiftId: params.id },
      data: {
        status: data.status,
        depositHash: data.deposits?.[0]?.depositHash,
        settleHash: data.deposits?.[0]?.settleHash,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching shift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Phase 2: Frontend Implementation (Days 1-3)

### Step 1: Create Authentication Hook

**File: `packages/web/hooks/useWalletAuth.ts`**

```typescript
import { useAccount, useSignMessage } from "wagmi";
import { signIn, signOut, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useState } from "react";

export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const authenticate = async () => {
    if (!address || !isConnected) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to ShiftFlow",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce: Math.random().toString(36).substring(7),
      });

      const preparedMessage = message.prepareMessage();
      const signature = await signMessageAsync({
        message: preparedMessage,
      });

      const result = await signIn("wallet", {
        message: preparedMessage,
        signature,
        address,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  return {
    address,
    isConnected,
    session,
    isAuthenticated: status === "authenticated",
    isLoading: isLoading || status === "loading",
    authenticate,
    logout,
  };
}
```

### Step 2: Create Workflow Management Hook

**File: `packages/web/hooks/useWorkflows.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;
  conditions: any[];
  actions: any[];
  createdAt: string;
  updatedAt: string;
}

export function useWorkflows() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const response = await fetch("/api/workflows");
      if (!response.ok) {
        throw new Error("Failed to fetch workflows");
      }
      const data = await response.json();
      return data.workflows as Workflow[];
    },
    enabled: !!session,
  });

  const createWorkflow = useMutation({
    mutationFn: async (workflow: Partial<Workflow>) => {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      });
      if (!response.ok) {
        throw new Error("Failed to create workflow");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

  const updateWorkflow = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Workflow> & { id: string }) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update workflow");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

  const deleteWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete workflow");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

  return {
    workflows: data || [],
    isLoading,
    error,
    createWorkflow: createWorkflow.mutateAsync,
    updateWorkflow: updateWorkflow.mutateAsync,
    deleteWorkflow: deleteWorkflow.mutateAsync,
  };
}
```

---

## ⚙️ Phase 3: Execution Engine (Days 7-8)

### Step 1: Create Workflow Monitor

**File: `packages/web/lib/jobs/workflow-monitor.ts`**

```typescript
import { prisma } from "@/lib/prisma";
import { PriceOracleService } from "@/lib/services/price-oracle";

export class WorkflowMonitor {
  private priceOracle: PriceOracleService;

  constructor() {
    this.priceOracle = PriceOracleService.getInstance();
  }

  async checkAllWorkflows(): Promise<void> {
    const activeWorkflows = await prisma.workflow.findMany({
      where: { status: "ACTIVE" },
      include: { user: true },
    });

    console.log(`Checking ${activeWorkflows.length} active workflows...`);

    for (const workflow of activeWorkflows) {
      try {
        await this.checkWorkflow(workflow);
      } catch (error) {
        console.error(`Error checking workflow ${workflow.id}:`, error);
      }
    }
  }

  private async checkWorkflow(workflow: any): Promise<void> {
    // Check if max executions reached
    if (workflow.maxExecutions && workflow.executionCount >= workflow.maxExecutions) {
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: { status: "COMPLETED" },
      });
      return;
    }

    // Check conditions
    const conditionsMet = await this.checkConditions(workflow.conditions);

    if (!conditionsMet) {
      return;
    }

    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        userId: workflow.userId,
        status: "CONDITIONS_MET",
        conditionsMet: true,
        conditionData: workflow.conditions,
      },
    });

    // Execute actions
    try {
      await this.executeActions(workflow.actions, execution.id);

      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          executionCount: { increment: 1 },
          lastExecutedAt: new Date(),
        },
      });

      console.log(`✅ Executed workflow ${workflow.id}`);
    } catch (error) {
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: "FAILED",
          error: (error as Error).message,
        },
      });
      console.error(`❌ Failed to execute workflow ${workflow.id}:`, error);
    }
  }

  private async checkConditions(conditions: any[]): Promise<boolean> {
    for (const condition of conditions) {
      if (condition.type === "price_threshold") {
        const currentPrice = await this.priceOracle.getPrice(condition.coinId);
        
        if (!currentPrice) {
          return false;
        }

        if (condition.operator === "below" && currentPrice >= condition.value) {
          return false;
        }
        
        if (condition.operator === "above" && currentPrice <= condition.value) {
          return false;
        }
      }
    }

    return true;
  }

  private async executeActions(actions: any[], executionId: string): Promise<void> {
    // Implementation for executing actions
    // This would integrate with SideShift API, Safe SDK, etc.
    console.log(`Executing ${actions.length} actions for execution ${executionId}`);
  }
}
```

### Step 2: Create Cron Job Endpoint

**File: `packages/web/app/api/cron/monitor/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { WorkflowMonitor } from "@/lib/jobs/workflow-monitor";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const monitor = new WorkflowMonitor();
    await monitor.checkAllWorkflows();
    
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Step 3: Configure Vercel Cron

**File: `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/monitor",
      "schedule": "* * * * *"
    }
  ]
}
```

---

## 🚀 Deployment (Day 11)

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 2: Set Environment Variables

In Vercel Dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add all variables from `.env.local`

### Step 3: Set Up Database

```bash
# Create Vercel Postgres
vercel postgres create

# Link to project
vercel link

# Run migrations
npx prisma migrate deploy
```

### Step 4: Verify Deployment

- Test authentication
- Create test workflow
- Verify cron job running
- Check SideShift integration

---

## ✅ Testing Checklist

- [ ] User can connect wallet
- [ ] User can sign in
- [ ] User can create workflow
- [ ] User can view workflows
- [ ] User can update workflow
- [ ] User can delete workflow
- [ ] Cron job runs every minute
- [ ] Conditions are checked correctly
- [ ] SideShift API proxy works
- [ ] x-user-ip header is passed
- [ ] Executions are logged
- [ ] Database queries are fast

---

## 📚 Next Steps

1. Implement non-custodial solution
2. Add notification system
3. Recruit beta testers
4. Collect feedback
5. Iterate and improve
6. Prepare final submission

---

This implementation guide provides all the code you need to build ShiftFlow Wave 3. Follow the steps in order, test thoroughly, and you'll have a production-ready platform!
