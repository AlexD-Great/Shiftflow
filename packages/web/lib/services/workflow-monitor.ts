import { prisma } from "@/lib/prisma";
import { getPriceOracle } from "@/lib/price-oracle";
import { NotificationService } from "./notification-service";
import { createExecutionReceipt } from "@/lib/execution-receipts";
import { Prisma } from "@prisma/client";

// CoinGecko ID mapping — single source of truth
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  SOL: "solana",
  DOGE: "dogecoin",
  MATIC: "matic-network",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
};

// Public RPC endpoints for gas price fetching (no API key required)
const NETWORK_RPC: Record<string, string> = {
  ethereum: "https://eth.llamarpc.com",
  eth: "https://eth.llamarpc.com",
  mainnet: "https://eth.llamarpc.com",
  polygon: "https://polygon-rpc.com",
  matic: "https://polygon-rpc.com",
  arbitrum: "https://arb1.arbitrum.io/rpc",
  arb: "https://arb1.arbitrum.io/rpc",
  optimism: "https://mainnet.optimism.io",
  base: "https://mainnet.base.org",
};

/**
 * Workflow Monitor Service
 * Checks active workflows and executes them when conditions are met
 */
export class WorkflowMonitor {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  private normalizeConditionType(type?: string): string {
    return (type || "").toLowerCase();
  }

  private normalizeActionType(type?: string): string {
    return (type || "").toLowerCase();
  }

  private isRequiredCondition(condition: any): boolean {
    return condition?.required === true || condition?.priority === "REQUIRED";
  }

  /**
   * Check all active workflows
   * Called by cron job every minute
   */
  async checkAllWorkflows(): Promise<void> {
    console.log("[Workflow Monitor] Starting workflow check...");

    try {
      const activeWorkflows = await prisma.workflow.findMany({
        where: { status: "ACTIVE" },
        include: { user: true },
      });

      console.log(`[Workflow Monitor] Found ${activeWorkflows.length} active workflows`);

      for (const workflow of activeWorkflows) {
        try {
          await this.checkWorkflow(workflow);
        } catch (error) {
          console.error(`[Workflow Monitor] Error checking workflow ${workflow.id}:`, error);
        }
      }

      console.log("[Workflow Monitor] Workflow check complete");
    } catch (error) {
      console.error("[Workflow Monitor] Error fetching workflows:", error);
    }
  }

  /**
   * Check a single workflow
   */
  private async checkWorkflow(workflow: any): Promise<void> {
    if (workflow.maxExecutions && workflow.executionCount >= workflow.maxExecutions) {
      console.log(`[Workflow Monitor] Workflow ${workflow.id} reached max executions, marking as completed`);
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: { status: "COMPLETED" },
      });
      return;
    }

    // Pass lastExecutedAt so time-based conditions can check elapsed time correctly
    const conditionsMet = await this.checkConditions(workflow.conditions, workflow.lastExecutedAt);

    if (!conditionsMet) {
      return;
    }

    console.log(`[Workflow Monitor] ✅ Conditions met for workflow ${workflow.id}`);

    // Notify user that conditions are met
    await this.notificationService.notifyConditionMet(
      workflow.userId,
      workflow.name,
      workflow.conditions
    );

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

    // Log execution start
    await prisma.executionLog.create({
      data: {
        executionId: execution.id,
        level: "INFO",
        message: "Workflow execution started",
        data: { workflowId: workflow.id, workflowName: workflow.name },
      },
    });

    // Execute actions
    try {
      await this.executeActions(workflow.actions, execution.id, workflow.userId);

      const executionDetails = await prisma.execution.findUnique({
        where: { id: execution.id },
        select: { actionResults: true, txHash: true },
      });

      const receiptResult = await createExecutionReceipt({
        workflowId: workflow.id,
        type: "TRADING",
        conditionSnapshot: workflow.conditions,
        actionsSnapshot: executionDetails?.actionResults || workflow.actions,
        status: "SUCCESS",
        txHash: executionDetails?.txHash || undefined,
      });

      // Mark execution as completed
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          actionResults: {
            ...(Array.isArray(executionDetails?.actionResults)
              ? { steps: executionDetails?.actionResults }
              : { previous: executionDetails?.actionResults }),
            receipt: receiptResult.receipt,
            receiptHash: receiptResult.receiptHash,
            anchorTxHash: receiptResult.anchorTxHash,
          } as Prisma.InputJsonValue,
        },
      });

      // Update workflow execution count
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          executionCount: { increment: 1 },
          lastExecutedAt: new Date(),
        },
      });

      // Log success
      await prisma.executionLog.create({
        data: {
          executionId: execution.id,
          level: "INFO",
          message: "Workflow execution completed successfully",
        },
      });

      // Send success notifications
      await this.notificationService.notifyWorkflowExecution(
        workflow.userId,
        workflow.name,
        execution.id,
        "success",
        {
          ...(executionDetails?.actionResults as object || {}),
          receiptHash: receiptResult.receiptHash,
          anchorTxHash: receiptResult.anchorTxHash,
        }
      );

      console.log(`[Workflow Monitor] ✅ Executed workflow ${workflow.id}`);
    } catch (error) {
      const failedReceipt = await createExecutionReceipt({
        workflowId: workflow.id,
        type: "TRADING",
        conditionSnapshot: workflow.conditions,
        actionsSnapshot: workflow.actions,
        status: "FAILED",
        error: (error as Error).message,
      });

      // Mark execution as failed
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: "FAILED",
          error: (error as Error).message,
          errorStack: (error as Error).stack,
          actionResults: {
            receipt: failedReceipt.receipt,
            receiptHash: failedReceipt.receiptHash,
            anchorTxHash: failedReceipt.anchorTxHash,
          } as Prisma.InputJsonValue,
        },
      });

      // Log error
      await prisma.executionLog.create({
        data: {
          executionId: execution.id,
          level: "ERROR",
          message: "Workflow execution failed",
          data: { error: (error as Error).message },
        },
      });

      // Send failure notifications
      await this.notificationService.notifyWorkflowExecution(
        workflow.userId,
        workflow.name,
        execution.id,
        "failed",
        {
          error: (error as Error).message,
          stack: (error as Error).stack,
          receiptHash: failedReceipt.receiptHash,
          anchorTxHash: failedReceipt.anchorTxHash,
        }
      );

      console.error(`[Workflow Monitor] ❌ Failed to execute workflow ${workflow.id}:`, error);
    }
  }

  /**
   * Check if all conditions are met
   */
  private async checkConditions(conditions: any[], lastExecutedAt?: Date | null): Promise<boolean> {
    for (const condition of conditions) {
      const met = await this.checkCondition(condition, lastExecutedAt);
      if (!met) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check a single condition
   */
  private async checkCondition(condition: any, lastExecutedAt?: Date | null): Promise<boolean> {
    const conditionType = this.normalizeConditionType(condition?.type);

    switch (conditionType) {
      case "composite":
        return this.checkCompositeCondition(condition, lastExecutedAt);

      case "price_threshold":
        return this.checkPriceThreshold(condition);

      case "gas_threshold":
        return this.checkGasThreshold(condition);

      case "time_based":
        return this.checkTimeBased(condition, lastExecutedAt);

      case "balance_threshold":
        return this.checkBalanceThreshold(condition);

      case "portfolio_value":
        return this.checkPortfolioValue(condition);

      default:
        console.warn(`[Workflow Monitor] Unknown condition type: ${condition?.type}`);
        return false;
    }
  }

  /**
   * Check price threshold condition
   */
  private async checkPriceThreshold(condition: any): Promise<boolean> {
    // Accept both CoinGecko IDs and uppercase ticker symbols
    const rawToken: string = (condition.coinId || condition.token || "").trim();
    const upperToken = rawToken.toUpperCase();
    const symbol = SYMBOL_TO_COINGECKO_ID[upperToken] ? upperToken : rawToken;

    const operator = condition.operator || condition.comparison;
    const value = Number(condition.value ?? condition.threshold);

    try {
      const oracle = getPriceOracle();
      const currentPrice = await oracle.getPrice(symbol);

      let met = false;
      switch (operator) {
        case "above":
          met = currentPrice > value;
          break;
        case "below":
          met = currentPrice < value;
          break;
        case "equals":
          met = Math.abs(currentPrice - value) < 0.01;
          break;
        default:
          console.warn(`[Workflow Monitor] Unknown operator: ${operator}`);
          return false;
      }

      if (met) {
        console.log(
          `[Workflow Monitor] Price condition met: ${symbol} ${operator} $${value} (current: $${currentPrice})`
        );
      }
      return met;
    } catch (error) {
      console.warn(`[Workflow Monitor] Could not fetch price for ${symbol}:`, error);
      return false;
    }
  }


  /**
   * Check composite condition (AND/OR) with optional preferred rules
   */
  private async checkCompositeCondition(condition: any, lastExecutedAt?: Date | null): Promise<boolean> {
    const childConditions = Array.isArray(condition?.conditions) ? condition.conditions : [];

    if (childConditions.length === 0) {
      return false;
    }

    const evaluated = await Promise.all(
      childConditions.map(async (child: any) => ({
        child,
        met: await this.checkCondition(child, lastExecutedAt),
      }))
    );

    const required = evaluated.filter(({ child }) => this.isRequiredCondition(child));
    const preferred = evaluated.filter(({ child }) => !this.isRequiredCondition(child));

    if (required.length > 0 && required.some(({ met }) => !met)) {
      return false;
    }

    const operator = (condition?.operator || 'AND').toUpperCase();

    if (operator === 'OR') {
      if (required.length > 0) {
        return true;
      }

      return preferred.some(({ met }) => met);
    }

    if (preferred.length > 0) {
      return preferred.every(({ met }) => met);
    }

    return true;
  }

  /**
   * Fetch live gas price in gwei from a public JSON-RPC endpoint
   */
  private async fetchGasPrice(network: string): Promise<number> {
    const rpcUrl = NETWORK_RPC[network.toLowerCase()];
    if (!rpcUrl) {
      console.warn(`[Workflow Monitor] No RPC for network: ${network}, using fallback`);
      return 30;
    }

    try {
      const resp = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
      });
      const json = await resp.json();
      // result is hex wei — convert to gwei
      const weiHex: string = json.result;
      const gwei = parseInt(weiHex, 16) / 1e9;
      return gwei;
    } catch (err) {
      console.warn(`[Workflow Monitor] Gas fetch failed for ${network}:`, err);
      return 30;
    }
  }

  /**
   * Check gas threshold condition using live RPC data
   */
  private async checkGasThreshold(condition: any): Promise<boolean> {
    const network = (condition.network || "ethereum").toLowerCase();
    const operator = condition.operator || condition.comparison || "below";
    const value = Number(condition.value ?? condition.threshold);

    const currentGas = await this.fetchGasPrice(network);

    console.log(
      `[Workflow Monitor] Gas check: ${network} = ${currentGas.toFixed(2)} gwei (${operator} ${value} gwei)`
    );

    if (operator === "below") return currentGas < value;
    if (operator === "above") return currentGas > value;

    console.warn(`[Workflow Monitor] Unknown gas operator: ${operator}`);
    return false;
  }

  /**
   * Check time-based condition using workflow.lastExecutedAt
   */
  private checkTimeBased(condition: any, lastExecutedAt?: Date | null): boolean {
    const schedule = (condition?.schedule || "daily").toLowerCase();

    // Never executed → always fire
    if (!lastExecutedAt) return true;

    const now = Date.now();
    const elapsedMs = now - new Date(lastExecutedAt).getTime();

    const scheduleIntervals: Record<string, number> = {
      hourly: 1000 * 60 * 60,
      daily: 1000 * 60 * 60 * 24,
      weekly: 1000 * 60 * 60 * 24 * 7,
      monthly: 1000 * 60 * 60 * 24 * 30,
    };

    const interval = scheduleIntervals[schedule];
    if (!interval) {
      console.warn(`[Workflow Monitor] Unknown schedule: ${schedule}`);
      return false;
    }

    const ready = elapsedMs >= interval;
    console.log(
      `[Workflow Monitor] Time check (${schedule}): ${Math.floor(elapsedMs / 60000)}m elapsed, need ${Math.floor(interval / 60000)}m → ${ready ? "READY" : "NOT YET"}`
    );
    return ready;
  }

  /**
   * Check native token balance threshold via public RPC
   */
  private async checkBalanceThreshold(condition: any): Promise<boolean> {
    const address: string = condition.address;
    const network: string = (condition.network || "ethereum").toLowerCase();
    const operator = condition.operator || condition.comparison || "above";
    const threshold = Number(condition.value ?? condition.threshold ?? 0);

    if (!address) {
      console.warn("[Workflow Monitor] Balance threshold missing address");
      return false;
    }

    const rpcUrl = NETWORK_RPC[network];
    if (!rpcUrl) {
      console.warn(`[Workflow Monitor] No RPC for balance check on network: ${network}`);
      return false;
    }

    try {
      const resp = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address, "latest"],
        }),
      });
      const json = await resp.json();
      // result is hex wei — convert to ETH
      const balanceEth = parseInt(json.result, 16) / 1e18;

      console.log(
        `[Workflow Monitor] Balance check: ${address} on ${network} = ${balanceEth.toFixed(6)} (${operator} ${threshold})`
      );

      if (operator === "above") return balanceEth > threshold;
      if (operator === "below") return balanceEth < threshold;
      return false;
    } catch (err) {
      console.warn(`[Workflow Monitor] Balance fetch failed for ${address}:`, err);
      return false;
    }
  }

  /**
   * Check portfolio value condition
   */
  private async checkPortfolioValue(condition: any): Promise<boolean> {
    console.log("[Workflow Monitor] Portfolio value checking not yet implemented");
    return false;
  }

  /**
   * Execute workflow actions
   */
  private async executeActions(actions: any[], executionId: string, userId: string): Promise<void> {
    console.log(`[Workflow Monitor] Executing ${actions.length} actions for execution ${executionId}`);

    const results: any[] = [];

    for (const action of actions) {
      try {
        const result = await this.executeAction(action, userId);
        results.push({ action: action.type, success: true, result });

        // Log action success
        await prisma.executionLog.create({
          data: {
            executionId,
            level: "INFO",
            message: `Action executed: ${action.type}`,
            data: { action, result },
          },
        });
      } catch (error) {
        results.push({ action: action.type, success: false, error: (error as Error).message });

        // Log action failure
        await prisma.executionLog.create({
          data: {
            executionId,
            level: "ERROR",
            message: `Action failed: ${action.type}`,
            data: { action, error: (error as Error).message },
          },
        });

        throw error; // Stop execution on first failure
      }
    }

    // Store action results
    await prisma.execution.update({
      where: { id: executionId },
      data: { actionResults: results },
    });
  }

  /**
   * Execute a single action (or multi-step action recursively)
   */
  private async executeAction(action: any, userId: string): Promise<any> {
    const actionType = this.normalizeActionType(action?.type);

    switch (actionType) {
      case "sideshift_swap":
      case "cross_chain_swap":
        return this.executeSideShiftSwap(action, userId);

      case "notification":
        return this.executeNotification(action, userId);

      case "webhook":
        return this.executeWebhook(action);

      case "multi_step": {
        const steps: any[] = Array.isArray(action.steps) ? action.steps : [];
        const results: any[] = [];
        for (let i = 0; i < steps.length; i++) {
          try {
            const result = await this.executeAction(steps[i], userId);
            results.push({ step: i + 1, success: true, result });
          } catch (err) {
            results.push({ step: i + 1, success: false, error: (err as Error).message });
            if (action.stopOnError !== false) throw err;
          }
        }
        return { type: "multi_step", steps: results };
      }

      default:
        throw new Error(`Unknown action type: ${action?.type}`);
    }
  }

  /**
   * Execute SideShift swap action
   */
  private async executeSideShiftSwap(action: any, userId: string): Promise<any> {
    console.log("[Workflow Monitor] Executing SideShift swap...");

    const {
      depositCoin,
      depositNetwork,
      settleCoin,
      settleNetwork,
      amount,
      settleAddress,
    } = action;

    // Validate required fields
    if (!depositCoin || !settleCoin || !amount || !settleAddress) {
      throw new Error("Missing required fields for SideShift swap");
    }

    try {
      // Step 1: Request quote from SideShift API
      console.log(`[Workflow Monitor] Requesting quote: ${depositCoin} -> ${settleCoin}`);
      
      const quoteResponse = await fetch("https://sideshift.ai/api/v2/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": process.env.SIDESHIFT_SECRET || "",
        },
        body: JSON.stringify({
          depositCoin,
          settleCoin,
          depositNetwork: depositNetwork || depositCoin,
          settleNetwork: settleNetwork || settleCoin,
          affiliateId: process.env.SIDESHIFT_AFFILIATE_ID || "",
        }),
      });

      if (!quoteResponse.ok) {
        const errorData = await quoteResponse.json();
        throw new Error(`SideShift quote failed: ${errorData.error?.message || quoteResponse.statusText}`);
      }

      const quote = await quoteResponse.json();
      console.log(`[Workflow Monitor] Quote received: ${quote.id}`);

      // Step 2: Create fixed shift
      console.log(`[Workflow Monitor] Creating fixed shift...`);
      
      const shiftResponse = await fetch("https://sideshift.ai/api/v2/shifts/fixed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": process.env.SIDESHIFT_SECRET || "",
        },
        body: JSON.stringify({
          quoteId: quote.id,
          settleAddress,
          affiliateId: process.env.SIDESHIFT_AFFILIATE_ID || "",
        }),
      });

      if (!shiftResponse.ok) {
        const errorData = await shiftResponse.json();
        throw new Error(`SideShift shift creation failed: ${errorData.error?.message || shiftResponse.statusText}`);
      }

      const shift = await shiftResponse.json();
      console.log(`[Workflow Monitor] Shift created: ${shift.id}`);

      // Step 3: Store shift in database
      await prisma.sideShiftOrder.create({
        data: {
          userId,
          shiftId: shift.id,
          depositCoin: shift.depositCoin,
          depositNetwork: shift.depositNetwork,
          settleCoin: shift.settleCoin,
          settleNetwork: shift.settleNetwork,
          depositAddress: shift.depositAddress,
          settleAddress: shift.settleAddress,
          depositAmount: shift.depositAmount,
          settleAmount: shift.settleAmount,
          expiresAt: new Date(shift.expiresAt),
          status: shift.status,
        },
      });

      console.log(`[Workflow Monitor] ✅ SideShift swap executed successfully`);

      // Return shift details
      return {
        type: "sideshift_swap",
        status: "created",
        shiftId: shift.id,
        depositAddress: shift.depositAddress,
        depositCoin: shift.depositCoin,
        depositAmount: shift.depositAmount,
        settleCoin: shift.settleCoin,
        settleAmount: shift.settleAmount,
        settleAddress: shift.settleAddress,
        expiresAt: shift.expiresAt,
        message: `Shift created successfully. Send ${shift.depositAmount} ${shift.depositCoin} to ${shift.depositAddress}`,
      };
    } catch (error) {
      console.error("[Workflow Monitor] SideShift swap failed:", error);
      throw error;
    }
  }

  /**
   * Execute notification action
   */
  private async executeNotification(action: any, userId: string): Promise<any> {
    console.log("[Workflow Monitor] Sending notification...");

    await prisma.notification.create({
      data: {
        userId,
        type: "WORKFLOW_EXECUTED",
        title: action.title || "Workflow Executed",
        message: action.message || "Your workflow has been executed successfully",
        data: action.data || {},
      },
    });

    return { type: "notification", status: "sent" };
  }

  /**
   * Execute webhook action
   */
  private async executeWebhook(action: any): Promise<any> {
    console.log("[Workflow Monitor] Calling webhook...");

    const response = await fetch(action.url, {
      method: action.method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...action.headers,
      },
      body: JSON.stringify(action.body || {}),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }

    return { type: "webhook", status: response.status, response: await response.text() };
  }
}
