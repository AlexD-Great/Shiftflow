/**
 * Workflow Executor Service
 * Monitors conditions and executes workflows when conditions are met
 */

import { SafeWorkflow, checkWorkflowConditions, workflowActionToSafeTx } from './safe-workflow'

export interface ExecutorConfig {
  checkInterval: number // milliseconds
  maxRetries: number
  onWorkflowExecuted?: (workflow: SafeWorkflow) => void
  onWorkflowFailed?: (workflow: SafeWorkflow, error: Error) => void
}

export class WorkflowExecutor {
  private workflows: Map<string, SafeWorkflow> = new Map()
  private intervalId: NodeJS.Timeout | null = null
  private config: ExecutorConfig
  private isRunning = false

  constructor(config: Partial<ExecutorConfig> = {}) {
    this.config = {
      checkInterval: config.checkInterval || 60000, // 1 minute default
      maxRetries: config.maxRetries || 3,
      onWorkflowExecuted: config.onWorkflowExecuted,
      onWorkflowFailed: config.onWorkflowFailed,
    }
  }

  /**
   * Add a workflow to monitor
   */
  addWorkflow(workflow: SafeWorkflow) {
    this.workflows.set(workflow.id, workflow)
    console.log(`[Executor] Added workflow: ${workflow.name} (${workflow.id})`)
  }

  /**
   * Remove a workflow from monitoring
   */
  removeWorkflow(workflowId: string) {
    this.workflows.delete(workflowId)
    console.log(`[Executor] Removed workflow: ${workflowId}`)
  }

  /**
   * Get all workflows
   */
  getWorkflows(): SafeWorkflow[] {
    return Array.from(this.workflows.values())
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): SafeWorkflow | undefined {
    return this.workflows.get(workflowId)
  }

  /**
   * Update workflow status
   */
  updateWorkflow(workflowId: string, updates: Partial<SafeWorkflow>) {
    const workflow = this.workflows.get(workflowId)
    if (workflow) {
      Object.assign(workflow, updates)
      this.workflows.set(workflowId, workflow)
    }
  }

  /**
   * Start monitoring workflows
   */
  start() {
    if (this.isRunning) {
      console.log('[Executor] Already running')
      return
    }

    this.isRunning = true
    console.log(`[Executor] Started monitoring ${this.workflows.size} workflows`)
    
    // Check immediately
    this.checkWorkflows()

    // Then check on interval
    this.intervalId = setInterval(() => {
      this.checkWorkflows()
    }, this.config.checkInterval)
  }

  /**
   * Stop monitoring workflows
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('[Executor] Stopped monitoring')
  }

  /**
   * Check all workflows and execute if conditions are met
   */
  private async checkWorkflows() {
    console.log(`[Executor] Checking ${this.workflows.size} workflows...`)

    // Fetch current market data
    const priceData = await this.fetchPriceData()
    const gasData = await this.fetchGasData()

    for (const workflow of this.workflows.values()) {
      // Skip if already executed or failed
      if (workflow.status === 'executed' || workflow.status === 'failed') {
        continue
      }

      try {
        // Check if conditions are met
        const conditionsMet = await checkWorkflowConditions(
          workflow,
          priceData,
          gasData
        )

        if (conditionsMet) {
          console.log(`[Executor] Conditions met for workflow: ${workflow.name}`)
          await this.executeWorkflow(workflow)
        }
      } catch (error) {
        console.error(`[Executor] Error checking workflow ${workflow.id}:`, error)
      }
    }
  }

  /**
   * Execute a workflow
   */
  private async executeWorkflow(workflow: SafeWorkflow) {
    console.log(`[Executor] Executing workflow: ${workflow.name}`)

    try {
      // Update status to proposed
      this.updateWorkflow(workflow.id, { status: 'proposed' })

      // For Safe workflows, we need to propose the transaction
      // This would integrate with the useSafe hook
      // For now, we'll mark it as proposed and log the actions
      
      console.log(`[Executor] Workflow actions:`, workflow.actions)

      // In a real implementation, this would:
      // 1. Create Safe transaction
      // 2. Sign with current user
      // 3. Propose to Safe Transaction Service
      // 4. Wait for other signers
      // 5. Execute when threshold reached

      // Simulate execution
      const txHash = `0x${Math.random().toString(16).slice(2)}`
      
      this.updateWorkflow(workflow.id, {
        status: 'executed',
        executedAt: Date.now(),
        executedTxHash: txHash,
      })

      console.log(`[Executor] Workflow executed: ${workflow.name}`)
      
      if (this.config.onWorkflowExecuted) {
        this.config.onWorkflowExecuted(workflow)
      }
    } catch (error) {
      console.error(`[Executor] Failed to execute workflow ${workflow.id}:`, error)
      
      this.updateWorkflow(workflow.id, { status: 'failed' })
      
      if (this.config.onWorkflowFailed) {
        this.config.onWorkflowFailed(workflow, error as Error)
      }
    }
  }

  /**
   * Fetch current price data
   */
  private async fetchPriceData(): Promise<Record<string, number>> {
    // TODO: Implement real price fetching
    // For now, return mock data
    return {
      'ETH/USD': 3500,
      'BTC/USD': 65000,
      'ETH/BTC': 0.054,
    }
  }

  /**
   * Fetch current gas data
   */
  private async fetchGasData(): Promise<Record<string, number>> {
    // TODO: Implement real gas fetching using GasOracleService
    // For now, return mock data
    return {
      ethereum: 25,
      polygon: 50,
      arbitrum: 0.1,
    }
  }

  /**
   * Get executor statistics
   */
  getStats() {
    const workflows = Array.from(this.workflows.values())
    return {
      total: workflows.length,
      pending: workflows.filter(w => w.status === 'pending').length,
      proposed: workflows.filter(w => w.status === 'proposed').length,
      executed: workflows.filter(w => w.status === 'executed').length,
      failed: workflows.filter(w => w.status === 'failed').length,
      isRunning: this.isRunning,
    }
  }
}

// Global executor instance
let executorInstance: WorkflowExecutor | null = null

export function getExecutor(): WorkflowExecutor {
  if (!executorInstance) {
    executorInstance = new WorkflowExecutor()
  }
  return executorInstance
}
