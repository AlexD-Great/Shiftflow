import {
  Workflow,
  WorkflowExecution,
  ExecutionStep,
  ConditionType,
  ActionType,
  PriceThresholdCondition,
  CrossChainSwapAction,
} from '../types';
import { SideShiftService } from './sideshift';
import { PriceOracleService } from './price-oracle';

export class WorkflowEngine {
  private sideshift: SideShiftService;
  private priceOracle: PriceOracleService;
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private monitoringInterval?: NodeJS.Timeout;

  constructor(
    sideshiftSecret: string,
    sideshiftAffiliateId: string,
    coingeckoApiKey?: string
  ) {
    this.sideshift = new SideShiftService(sideshiftSecret, sideshiftAffiliateId);
    this.priceOracle = new PriceOracleService(coingeckoApiKey);
  }

  /**
   * Register a new workflow
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
    console.log(`[WorkflowEngine] Registered workflow: ${workflow.id} - ${workflow.name}`);
  }

  /**
   * Start monitoring all active workflows
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      console.log('[WorkflowEngine] Monitoring already started');
      return;
    }

    console.log(`[WorkflowEngine] Starting workflow monitoring (interval: ${intervalMs}ms)`);
    
    this.monitoringInterval = setInterval(() => {
      this.checkAllWorkflows();
    }, intervalMs);

    // Run initial check immediately
    this.checkAllWorkflows();
  }

  /**
   * Stop monitoring workflows
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('[WorkflowEngine] Stopped workflow monitoring');
    }
  }

  /**
   * Check all active workflows for condition triggers
   */
  private async checkAllWorkflows(): Promise<void> {
    const activeWorkflows = Array.from(this.workflows.values()).filter(
      w => w.status === 'active'
    );

    console.log(`[WorkflowEngine] Checking ${activeWorkflows.length} active workflows`);

    for (const workflow of activeWorkflows) {
      try {
        await this.checkWorkflow(workflow);
      } catch (error) {
        console.error(`[WorkflowEngine] Error checking workflow ${workflow.id}:`, error);
      }
    }
  }

  /**
   * Check a single workflow and execute if condition is met
   */
  private async checkWorkflow(workflow: Workflow): Promise<void> {
    workflow.lastCheckedAt = new Date();

    // Check condition
    const conditionMet = await this.evaluateCondition(workflow.condition);

    if (conditionMet) {
      console.log(`[WorkflowEngine] Condition met for workflow: ${workflow.id}`);
      await this.executeWorkflow(workflow);
    }
  }

  /**
   * Evaluate if a workflow condition is met
   */
  private async evaluateCondition(condition: Workflow['condition']): Promise<boolean> {
    switch (condition.type) {
      case ConditionType.PRICE_THRESHOLD:
        return this.evaluatePriceThreshold(condition);
      
      default:
        console.warn(`[WorkflowEngine] Unknown condition type: ${condition.type}`);
        return false;
    }
  }

  /**
   * Evaluate price threshold condition
   */
  private async evaluatePriceThreshold(
    condition: PriceThresholdCondition
  ): Promise<boolean> {
    const result = await this.priceOracle.checkPriceThreshold(
      condition.token,
      condition.comparison,
      condition.threshold,
      condition.currency
    );

    console.log(
      `[WorkflowEngine] Price check: ${condition.token} = $${result.currentPrice} ` +
      `(threshold: ${condition.comparison} $${condition.threshold}) - ${result.met ? 'MET' : 'NOT MET'}`
    );

    return result.met;
  }

  /**
   * Execute a workflow's actions
   */
  private async executeWorkflow(workflow: Workflow): Promise<void> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      status: 'executing',
      startedAt: new Date(),
      steps: [],
    };

    this.executions.set(executionId, execution);

    try {
      console.log(`[WorkflowEngine] Executing workflow: ${workflow.id}`);

      for (const action of workflow.actions) {
        await this.executeAction(action, execution);
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
      workflow.executionCount++;

      console.log(`[WorkflowEngine] Workflow execution completed: ${executionId}`);
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.completedAt = new Date();

      console.error(`[WorkflowEngine] Workflow execution failed: ${executionId}`, error);
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: Workflow['actions'][0],
    execution: WorkflowExecution
  ): Promise<void> {
    switch (action.type) {
      case ActionType.CROSS_CHAIN_SWAP:
        await this.executeCrossChainSwap(action, execution);
        break;
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute cross-chain swap action
   */
  private async executeCrossChainSwap(
    action: CrossChainSwapAction,
    execution: WorkflowExecution
  ): Promise<void> {
    // Step 1: Request quote
    const quoteStep: ExecutionStep = {
      id: `step_${Date.now()}_1`,
      type: 'quote_request',
      status: 'executing',
      timestamp: new Date(),
    };
    execution.steps.push(quoteStep);

    const quote = await this.sideshift.requestQuote({
      depositCoin: action.depositCoin,
      depositNetwork: action.depositNetwork,
      settleCoin: action.settleCoin,
      settleNetwork: action.settleNetwork,
      depositAmount: action.amount,
    });

    quoteStep.status = 'completed';
    quoteStep.data = quote;

    console.log(`[WorkflowEngine] Quote received: ${quote.id}`);

    // Step 2: Create shift
    const shiftStep: ExecutionStep = {
      id: `step_${Date.now()}_2`,
      type: 'shift_create',
      status: 'executing',
      timestamp: new Date(),
    };
    execution.steps.push(shiftStep);

    const shift = await this.sideshift.createFixedShift({
      quoteId: quote.id,
      settleAddress: action.settleAddress,
    });

    shiftStep.status = 'completed';
    shiftStep.data = shift;

    console.log(
      `[WorkflowEngine] Shift created: ${shift.id}\n` +
      `  Deposit ${shift.depositAmount} ${shift.depositCoin} to: ${shift.depositAddress}\n` +
      `  Receive ${shift.settleAmount} ${shift.settleCoin} at: ${shift.settleAddress}`
    );

    // Step 3: Monitor shift (non-blocking for demo)
    const monitorStep: ExecutionStep = {
      id: `step_${Date.now()}_3`,
      type: 'shift_monitor',
      status: 'executing',
      timestamp: new Date(),
    };
    execution.steps.push(monitorStep);

    // Note: In production, this would be handled by a separate monitoring service
    // For demo, we'll just mark it as completed with the initial shift data
    monitorStep.status = 'completed';
    monitorStep.data = shift;

    console.log(`[WorkflowEngine] Shift monitoring initiated: ${shift.id}`);
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  /**
   * Get execution by ID
   */
  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get all executions for a workflow
   */
  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(
      e => e.workflowId === workflowId
    );
  }
}
