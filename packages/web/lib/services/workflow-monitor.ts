import { prisma } from "@/lib/prisma";
import { PriceOracleService } from "./price-oracle";

/**
 * Workflow Monitor Service
 * Checks active workflows and executes them when conditions are met
 */
export class WorkflowMonitor {
  private priceOracle: PriceOracleService;

  constructor() {
    this.priceOracle = PriceOracleService.getInstance();
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
    // Check if max executions reached
    if (workflow.maxExecutions && workflow.executionCount >= workflow.maxExecutions) {
      console.log(`[Workflow Monitor] Workflow ${workflow.id} reached max executions, marking as completed`);
      
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

    console.log(`[Workflow Monitor] ✅ Conditions met for workflow ${workflow.id}`);

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

      // Mark execution as completed
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
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

      console.log(`[Workflow Monitor] ✅ Executed workflow ${workflow.id}`);
    } catch (error) {
      // Mark execution as failed
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: "FAILED",
          error: (error as Error).message,
          errorStack: (error as Error).stack,
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

      console.error(`[Workflow Monitor] ❌ Failed to execute workflow ${workflow.id}:`, error);
    }
  }

  /**
   * Check if all conditions are met
   */
  private async checkConditions(conditions: any[]): Promise<boolean> {
    for (const condition of conditions) {
      const met = await this.checkCondition(condition);
      if (!met) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check a single condition
   */
  private async checkCondition(condition: any): Promise<boolean> {
    switch (condition.type) {
      case "price_threshold":
        return this.checkPriceThreshold(condition);
      
      case "time_based":
        return this.checkTimeBased(condition);
      
      case "portfolio_value":
        return this.checkPortfolioValue(condition);
      
      default:
        console.warn(`[Workflow Monitor] Unknown condition type: ${condition.type}`);
        return false;
    }
  }

  /**
   * Check price threshold condition
   */
  private async checkPriceThreshold(condition: any): Promise<boolean> {
    const { coinId, operator, value } = condition;

    const currentPrice = await this.priceOracle.getPrice(coinId);
    
    if (currentPrice === null) {
      console.warn(`[Workflow Monitor] Could not fetch price for ${coinId}`);
      return false;
    }

    let met = false;

    switch (operator) {
      case "above":
        met = currentPrice > value;
        break;
      case "below":
        met = currentPrice < value;
        break;
      case "equals":
        met = Math.abs(currentPrice - value) < 0.01; // Within 1 cent
        break;
      default:
        console.warn(`[Workflow Monitor] Unknown operator: ${operator}`);
        return false;
    }

    if (met) {
      console.log(`[Workflow Monitor] Price condition met: ${coinId} ${operator} ${value} (current: ${currentPrice})`);
    }

    return met;
  }

  /**
   * Check time-based condition
   */
  private checkTimeBased(condition: any): boolean {
    const { schedule, lastExecuted } = condition;
    const now = new Date();

    // Simple daily check
    if (schedule === "daily") {
      if (!lastExecuted) return true;
      
      const lastExec = new Date(lastExecuted);
      const hoursSince = (now.getTime() - lastExec.getTime()) / (1000 * 60 * 60);
      
      return hoursSince >= 24;
    }

    // Weekly check
    if (schedule === "weekly") {
      if (!lastExecuted) return true;
      
      const lastExec = new Date(lastExecuted);
      const daysSince = (now.getTime() - lastExec.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysSince >= 7;
    }

    return false;
  }

  /**
   * Check portfolio value condition
   */
  private async checkPortfolioValue(condition: any): Promise<boolean> {
    // TODO: Implement portfolio value checking
    // This would integrate with wallet balance checking
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
   * Execute a single action
   */
  private async executeAction(action: any, userId: string): Promise<any> {
    switch (action.type) {
      case "sideshift_swap":
        return this.executeSideShiftSwap(action, userId);
      
      case "notification":
        return this.executeNotification(action, userId);
      
      case "webhook":
        return this.executeWebhook(action);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
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
          rate: shift.rate,
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
        rate: shift.rate,
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
