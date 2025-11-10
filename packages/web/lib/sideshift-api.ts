/**
 * SideShift.ai API Integration
 * Official API: https://sideshift.ai/api
 */

const SIDESHIFT_API_BASE = 'https://sideshift.ai/api/v2'

export interface SideShiftAsset {
  coin: string
  name: string
  network: string
  hasMemo: boolean
  fixedOnly: boolean[]
  variableOnly: boolean[]
  depositOffline: boolean
  settleOffline: boolean
}

export interface SideShiftQuote {
  id: string
  createdAt: string
  depositCoin: string
  settleCoin: string
  depositNetwork: string
  settleNetwork: string
  expiresAt: string
  depositAmount: string
  settleAmount: string
  rate: string
}

export interface SideShiftOrder {
  id: string
  createdAt: string
  depositCoin: string
  settleCoin: string
  depositNetwork: string
  settleNetwork: string
  depositAddress: string
  settleAddress: string
  depositAmount: string
  settleAmount: string
  expiresAt: string
  status: 'waiting' | 'processing' | 'settling' | 'settled' | 'refunding' | 'refunded'
  depositHash?: string
  settleHash?: string
}

export interface CreateShiftParams {
  depositCoin: string
  settleCoin: string
  depositNetwork?: string
  settleNetwork?: string
  settleAddress: string
  affiliateId?: string
  depositAmount?: string
  settleAmount?: string
}

/**
 * SideShift API Client
 */
export class SideShiftAPI {
  private apiKey?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  /**
   * Get list of supported assets
   */
  async getAssets(): Promise<SideShiftAsset[]> {
    const response = await fetch(`${SIDESHIFT_API_BASE}/coins`)
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * Get trading pair info
   */
  async getPairInfo(depositCoin: string, settleCoin: string) {
    const response = await fetch(
      `${SIDESHIFT_API_BASE}/pair/${depositCoin}/${settleCoin}`
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch pair info: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * Get a quote for a shift
   */
  async getQuote(params: {
    depositCoin: string
    settleCoin: string
    depositAmount?: string
    settleAmount?: string
    depositNetwork?: string
    settleNetwork?: string
  }): Promise<SideShiftQuote> {
    const body: any = {
      depositCoin: params.depositCoin,
      settleCoin: params.settleCoin,
    }

    if (params.depositNetwork) body.depositNetwork = params.depositNetwork
    if (params.settleNetwork) body.settleNetwork = params.settleNetwork
    if (params.depositAmount) body.depositAmount = params.depositAmount
    if (params.settleAmount) body.settleAmount = params.settleAmount

    const response = await fetch(`${SIDESHIFT_API_BASE}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to get quote: ${error.error?.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create a fixed-rate shift order
   */
  async createFixedShift(params: CreateShiftParams): Promise<SideShiftOrder> {
    const body: any = {
      depositCoin: params.depositCoin,
      settleCoin: params.settleCoin,
      settleAddress: params.settleAddress,
    }

    if (params.depositNetwork) body.depositNetwork = params.depositNetwork
    if (params.settleNetwork) body.settleNetwork = params.settleNetwork
    if (params.depositAmount) body.depositAmount = params.depositAmount
    if (params.settleAmount) body.settleAmount = params.settleAmount
    if (params.affiliateId) body.affiliateId = params.affiliateId

    const response = await fetch(`${SIDESHIFT_API_BASE}/shifts/fixed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'x-sideshift-secret': this.apiKey }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to create shift: ${error.error?.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create a variable-rate shift order
   */
  async createVariableShift(params: CreateShiftParams): Promise<SideShiftOrder> {
    const body: any = {
      depositMethod: params.depositCoin,
      settleMethod: params.settleCoin,
      settleAddress: params.settleAddress,
    }

    if (params.depositNetwork) body.depositNetwork = params.depositNetwork
    if (params.settleNetwork) body.settleNetwork = params.settleNetwork
    if (params.affiliateId) body.affiliateId = params.affiliateId

    const response = await fetch(`${SIDESHIFT_API_BASE}/shifts/variable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'x-sideshift-secret': this.apiKey }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to create shift: ${error.error?.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get shift order status
   */
  async getShiftStatus(orderId: string): Promise<SideShiftOrder> {
    const response = await fetch(`${SIDESHIFT_API_BASE}/shifts/${orderId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to get shift status: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get recent shifts (requires API key)
   */
  async getRecentShifts(): Promise<SideShiftOrder[]> {
    if (!this.apiKey) {
      throw new Error('API key required for this endpoint')
    }

    const response = await fetch(`${SIDESHIFT_API_BASE}/shifts`, {
      headers: {
        'x-sideshift-secret': this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get shifts: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get current exchange rate
   */
  async getRate(depositCoin: string, settleCoin: string): Promise<number> {
    const pairInfo = await this.getPairInfo(depositCoin, settleCoin)
    return parseFloat(pairInfo.rate)
  }

  /**
   * Estimate settlement amount
   */
  async estimateSettlement(
    depositCoin: string,
    settleCoin: string,
    depositAmount: string
  ): Promise<{ settleAmount: string; rate: string }> {
    const quote = await this.getQuote({
      depositCoin,
      settleCoin,
      depositAmount,
    })

    return {
      settleAmount: quote.settleAmount,
      rate: quote.rate,
    }
  }
}

// Singleton instance
let sideshiftInstance: SideShiftAPI | null = null

export function getSideShiftAPI(apiKey?: string): SideShiftAPI {
  if (!sideshiftInstance) {
    sideshiftInstance = new SideShiftAPI(apiKey)
  }
  return sideshiftInstance
}

/**
 * Helper function to format shift status for display
 */
export function formatShiftStatus(status: SideShiftOrder['status']): {
  label: string
  color: string
  description: string
} {
  switch (status) {
    case 'waiting':
      return {
        label: 'Waiting for Deposit',
        color: 'yellow',
        description: 'Send funds to the deposit address',
      }
    case 'processing':
      return {
        label: 'Processing',
        color: 'blue',
        description: 'Deposit received, processing swap',
      }
    case 'settling':
      return {
        label: 'Settling',
        color: 'blue',
        description: 'Sending funds to your address',
      }
    case 'settled':
      return {
        label: 'Completed',
        color: 'green',
        description: 'Swap completed successfully',
      }
    case 'refunding':
      return {
        label: 'Refunding',
        color: 'orange',
        description: 'Refunding your deposit',
      }
    case 'refunded':
      return {
        label: 'Refunded',
        color: 'red',
        description: 'Deposit refunded',
      }
    default:
      return {
        label: 'Unknown',
        color: 'gray',
        description: 'Unknown status',
      }
  }
}
