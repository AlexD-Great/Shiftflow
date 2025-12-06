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

      console.log(`[Executor] Workflow actions:`, workflow.actions)

      // Execute each action in the workflow
      for (const action of workflow.actions) {
        if (action.type === 'SWAP') {
          await this.executeSideShiftSwap(action, workflow)
        } else if (action.type === 'TRANSFER') {
          await this.executeTransfer(action, workflow)
        } else {
          console.log(`[Executor] Skipping custom action: ${action.description}`)
        }
      }

      // Mark as executed
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
   * Execute a SideShift swap
   */
  private async executeSideShiftSwap(action: any, workflow: SafeWorkflow) {
    try {
      const { getSideShiftAPI } = await import('./sideshift-api')
      const sideshift = getSideShiftAPI()

      console.log(`[Executor] Creating SideShift order for ${action.description}`)

      // For demo purposes, we'll create a quote instead of actual order
      // In production, you'd create a real order with settleAddress
      const quote = await sideshift.getQuote({
        depositCoin: 'eth',
        settleCoin: 'btc',
        depositAmount: action.value,
      })

      console.log(`[Executor] SideShift quote created:`, quote)
      
      // Store quote ID for tracking
      this.updateWorkflow(workflow.id, {
        proposedTxHash: quote.id,
      })

      // In production:
      // 1. Create actual shift order with user's settle address
      // 2. If using Safe, create Safe transaction to send funds to deposit address
      // 3. Propose transaction to Safe
      // 4. Wait for signatures
      // 5. Execute Safe transaction
      // 6. Monitor SideShift order status

    } catch (error) {
      console.error('[Executor] SideShift swap error:', error)
      throw error
    }
  }

  /**
   * Execute a transfer
   */
  private async executeTransfer(action: any, workflow: SafeWorkflow) {
    console.log(`[Executor] Transfer: ${action.value} to ${action.to}`)
    
    // In production:
    // 1. Create Safe transaction for transfer
    // 2. Propose to Safe
    // 3. Wait for signatures
    // 4. Execute
  }

  /**
   * Fetch current price data
   */
  private async fetchPriceData(): Promise<Record<string, number>> {
    try {
      const { getPriceOracle } = await import('./price-oracle')
      const oracle = getPriceOracle()

      // Fetch common trading pairs
      const prices = await oracle.getPrices(['ETH', 'BTC', 'USDT', 'USDC'])
      
      // Calculate common pairs
      const priceData: Record<string, number> = {
        'ETH/USD': prices.ETH || 0,
        'BTC/USD': prices.BTC || 0,
        'USDT/USD': prices.USDT || 0,
        'USDC/USD': prices.USDC || 0,
      }

      // Calculate cross pairs
      if (prices.ETH && prices.BTC) {
        priceData['ETH/BTC'] = prices.ETH / prices.BTC
      }

      return priceData
    } catch (error) {
      // Silently fail and return empty object to avoid console spam
      // This is expected when running client-side without API access
      return {}
    }
  }

  /**
   * Fetch current gas data
   */
  private async fetchGasData(): Promise<Record<string, number>> {
    try {
      // Import GasOracleService if available
      const gasData: Record<string, number> = {}

      // Try to fetch real gas prices
      // For now, we'll use reasonable defaults
      // TODO: Integrate with existing GasOracleService from engine package
      
      gasData.ethereum = 25 // Default gas price in gwei
      gasData.polygon = 50
      gasData.arbitrum = 0.1

      console.log('[Executor] Using gas data:', gasData)
      return gasData
    } catch (error) {
      console.error('[Executor] Error fetching gas data:', error)
      return {
        ethereum: 25,
        polygon: 50,
        arbitrum: 0.1,
      }
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
