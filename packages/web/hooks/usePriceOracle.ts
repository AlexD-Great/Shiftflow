import { useState, useEffect } from 'react'
import { getPriceOracle, PriceData } from '@/lib/price-oracle'

export function usePriceOracle(symbols: string[], refreshInterval: number = 60000) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const oracle = getPriceOracle()
        const priceData: Record<string, PriceData> = {}

        for (const symbol of symbols) {
          try {
            const data = await oracle.getPriceData(symbol)
            priceData[symbol] = data
          } catch (err) {
            console.error(`Failed to fetch price for ${symbol}:`, err)
          }
        }

        setPrices(priceData)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch prices')
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
