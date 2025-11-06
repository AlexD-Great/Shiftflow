import { WorkflowEngine, Workflow, WorkflowExecution } from '@shiftflow/engine';

export interface ShiftFlowConfig {
  sideshiftSecret: string;
  sideshiftAffiliateId: string;
  coingeckoApiKey?: string;
}

/**
 * ShiftFlow SDK Client
 * 
 * Main entry point for integrating ShiftFlow into your application
 */
export class ShiftFlowClient {
  private engine: WorkflowEngine;

  constructor(config: ShiftFlowConfig) {
    this.engine = new WorkflowEngine(
      config.sideshiftSecret,
      config.sideshiftAffiliateId,
      config.coingeckoApiKey
    );
  }

  /**
   * Register a workflow for execution
   */
  registerWorkflow(workflow: Workflow): void {
    this.engine.registerWorkflow(workflow);
  }

  /**
   * Start monitoring workflows
   * @param intervalMs - How often to check conditions (default: 30 seconds)
   */
  startMonitoring(intervalMs?: number): void {
    this.engine.startMonitoring(intervalMs);
  }

  /**
   * Stop monitoring workflows
   */
  stopMonitoring(): void {
    this.engine.stopMonitoring();
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(id: string): Workflow | undefined {
    return this.engine.getWorkflow(id);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return this.engine.getAllWorkflows();
  }

  /**
   * Get execution history for a workflow
   */
  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return this.engine.getWorkflowExecutions(workflowId);
  }

  /**
   * Get execution by ID
   */
  getExecution(id: string): WorkflowExecution | undefined {
    return this.engine.getExecution(id);
  }
}
