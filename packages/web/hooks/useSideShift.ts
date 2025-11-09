import { useState } from 'react'
import { getSideShiftAPI, SideShiftQuote, SideShiftOrder } from '@/lib/sideshift-api'

export function useSideShift() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getQuote = async (
    depositCoin: string,
    settleCoin: string,
    depositAmount: string
  ): Promise<SideShiftQuote | null> => {
    setLoading(true)
    setError(null)

    try {
      const api = getSideShiftAPI()
      const quote = await api.getQuote({
        depositCoin,
        settleCoin,
        depositAmount,
      })
      return quote
    } catch (err: any) {
      setError(err.message || 'Failed to get quote')
      return null
    } finally {
      setLoading(false)
    }
  }

  const createShift = async (
    depositCoin: string,
    settleCoin: string,
    settleAddress: string,
    depositAmount?: string
  ): Promise<SideShiftOrder | null> => {
    setLoading(true)
    setError(null)

    try {
      const api = getSideShiftAPI()
      const order = await api.createFixedShift({
        depositCoin,
        settleCoin,
        settleAddress,
        depositAmount,
      })
      return order
    } catch (err: any) {
      setError(err.message || 'Failed to create shift')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getShiftStatus = async (orderId: string): Promise<SideShiftOrder | null> => {
    setLoading(true)
    setError(null)

    try {
      const api = getSideShiftAPI()
      const order = await api.getShiftStatus(orderId)
      return order
    } catch (err: any) {
      setError(err.message || 'Failed to get shift status')
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
