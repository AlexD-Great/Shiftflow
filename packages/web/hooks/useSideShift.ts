import { useState } from 'react'

export interface SideShiftQuote {
  id: string;
  depositCoin: string;
  settleCoin: string;
  depositAmount: string;
  settleAmount: string;
  rate: string;
  expiresAt: string;
}

export interface SideShiftOrder {
  id: string;
  depositCoin: string;
  settleCoin: string;
  depositAmount: string;
  settleAmount: string;
  depositAddress: string;
  settleAddress: string;
  status: string;
  expiresAt?: string;
}

/**
 * Hook for interacting with SideShift API through our backend proxy
 * IMPORTANT: All requests go through backend to pass x-user-ip header (Mike's requirement)
 */
export function useSideShift() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Request a quote from SideShift
   * Goes through /api/sideshift/quote proxy
   */
  const getQuote = async (
    depositCoin: string,
    settleCoin: string,
    depositAmount: string,
    depositNetwork?: string,
    settleNetwork?: string
  ): Promise<SideShiftQuote | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sideshift/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depositCoin,
          settleCoin,
          depositAmount,
          depositNetwork,
          settleNetwork,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get quote')
      }

      const quote = await response.json()
      console.log('✅ Quote received:', quote.id)
      return quote
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get quote'
      setError(errorMessage)
      console.error('❌ Quote error:', errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a fixed shift
   * Goes through /api/sideshift/shift/fixed proxy
   */
  const createShift = async (
    quoteId: string,
    settleAddress: string,
    refundAddress?: string
  ): Promise<SideShiftOrder | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sideshift/shift/fixed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId,
          settleAddress,
          refundAddress,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create shift')
      }

      const order = await response.json()
      console.log('✅ Shift created:', order.id)
      return order
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create shift'
      setError(errorMessage)
      console.error('❌ Shift creation error:', errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get shift status
   * Goes through /api/sideshift/shift/:id proxy
   */
  const getShiftStatus = async (shiftId: string): Promise<SideShiftOrder | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sideshift/shift/${shiftId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get shift status')
      }

      const order = await response.json()
      console.log('✅ Shift status:', order.status)
      return order
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get shift status'
      setError(errorMessage)
      console.error('❌ Shift status error:', errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getQuote,
    createShift,
    getShiftStatus,
  }
}
