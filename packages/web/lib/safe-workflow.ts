/**
 * Safe Workflow Integration
 * Connects ShiftFlow workflows with Safe multi-sig execution
 */

import { parseEther, encodeFunctionData } from 'viem'

export interface SafeWorkflowAction {
  type: 'SWAP' | 'TRANSFER' | 'CUSTOM'
  to: string
  value: string
  data?: string
  description: string
}

export interface SafeWorkflow {
  id: string
  name: string
  safeAddress: string
  actions: SafeWorkflowAction[]
  condition: any // Workflow condition
  status: 'pending' | 'proposed' | 'executed' | 'failed'
  proposedTxHash?: string
  executedTxHash?: string
  createdAt: number
  executedAt?: number
}

/**
 * Convert a ShiftFlow workflow action to Safe transaction parameters
 */
export function workflowActionToSafeTx(action: SafeWorkflowAction) {
  switch (action.type) {
    case 'SWAP':
      // For SideShift swaps, we'd interact with their contract
      // This is a placeholder - actual implementation depends on SideShift's contract
      return {
        to: action.to,
        value: action.value,
        data: action.data || '0x',
      }
    
    case 'TRANSFER':
      // Simple ETH transfer
      return {
        to: action.to,
        value: action.value,
        data: '0x',
      }
    
    case 'CUSTOM':
      // Custom contract interaction
      return {
        to: action.to,
        value: action.value,
        data: action.data || '0x',
      }
    
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

/**
 * Create a Safe workflow from builder data
 */
export function createSafeWorkflow(
  workflowData: any,
  safeAddress: string
): SafeWorkflow {
  const actions: SafeWorkflowAction[] = workflowData.actions.map((action: any) => {
    // Convert workflow action to Safe action
    if (action.type === 'SHIFT') {
      return {
        type: 'SWAP' as const,
        to: action.toAddress || '0x0000000000000000000000000000000000000000',
        value: parseEther(action.amount || '0').toString(),
        description: `Swap ${action.fromAsset} to ${action.toAsset}`,
      }
    }
    
    return {
      type: 'CUSTOM' as const,
      to: '0x0000000000000000000000000000000000000000',
      value: '0',
      description: 'Custom action',
    }
  })

  return {
    id: `workflow-${Date.now()}`,
    name: workflowData.name || 'Unnamed Workflow',
    safeAddress,
    actions,
    condition: workflowData.condition,
    status: 'pending',
    createdAt: Date.now(),
  }
}

/**
 * Check if workflow conditions are met
 */
export async function checkWorkflowConditions(
  workflow: SafeWorkflow,
  priceData: any,
  gasData: any
): Promise<boolean> {
  const condition = workflow.condition

  switch (condition.type) {
    case 'PRICE_THRESHOLD':
      const currentPrice = priceData[condition.pair]
      if (!currentPrice) return false
      
      if (condition.comparison === 'below') {
        return currentPrice < condition.threshold
      } else {
        return currentPrice > condition.threshold
      }
    
    case 'GAS_THRESHOLD':
      const currentGas = gasData[condition.network]
      if (!currentGas) return false
      
      if (condition.comparison === 'below') {
        return currentGas < condition.threshold
      } else {
        return currentGas > condition.threshold
      }
    
    case 'TIME_BASED':
      const now = Date.now()
      return now >= condition.timestamp
    
    case 'COMPOSITE':
      // Handle AND/OR logic
      const results = await Promise.all(
        condition.conditions.map((c: any) => 
          checkWorkflowConditions({ ...workflow, condition: c }, priceData, gasData)
        )
      )
      
      if (condition.operator === 'AND') {
        return results.every(r => r)
      } else {
        return results.some(r => r)
      }
    
    default:
      return false
  }
}

/**
 * Format Safe transaction for display
 */
export function formatSafeTransaction(action: SafeWorkflowAction) {
  return {
    title: action.description,
    details: [
      { label: 'To', value: action.to },
      { label: 'Value', value: `${action.value} ETH` },
      { label: 'Type', value: action.type },
    ],
  }
}

/**
 * Get Safe transaction status message
 */
export function getSafeWorkflowStatusMessage(workflow: SafeWorkflow): string {
  switch (workflow.status) {
    case 'pending':
      return 'Waiting for conditions to be met'
    case 'proposed':
      return `Transaction proposed. Awaiting signatures. TX: ${workflow.proposedTxHash?.slice(0, 10)}...`
    case 'executed':
      return `Executed successfully! TX: ${workflow.executedTxHash?.slice(0, 10)}...`
    case 'failed':
      return 'Execution failed. Check transaction details.'
    default:
      return 'Unknown status'
  }
}
