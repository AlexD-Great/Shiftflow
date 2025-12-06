import { useState, useEffect } from 'react'
import { getPriceOracle, PriceData } from '@/lib/price-oracle-client'

export function usePriceOracle(symbols: string[], refreshInterval: number = 60000) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (symbols.length === 0) {
      setLoading(false)
      return
    }

    const fetchPrices = async () => {
      try {
        const oracle = getPriceOracle()
        const priceData: Record<string, PriceData> = {}

        for (const symbol of symbols) {
          try {
            const data = await oracle.getPriceData(symbol)
            priceData[symbol] = data
          } catch (err) {
            // Silently fail for individual symbols
            // Don't log to console to avoid spamming errors
          }
        }

        setPrices(priceData)
        setError(null)
      } catch (err: any) {
        // Only set error if all symbols failed
        if (Object.keys(prices).length === 0) {
          setError(err.message || 'Failed to fetch prices')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()

    // Refresh prices on interval
    const interval = setInterval(fetchPrices, refreshInterval)

    return () => clearInterval(interval)
  }, [symbols.join(','), refreshInterval])

  return { prices, loading, error }
}

export function usePrice(symbol: string, refreshInterval: number = 60000) {
  const { prices, loading, error } = usePriceOracle([symbol], refreshInterval)
  return {
    price: prices[symbol]?.price || 0,
    priceData: prices[symbol],
    loading,
    error,
  }
}
