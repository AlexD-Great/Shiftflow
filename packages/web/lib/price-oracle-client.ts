/**
 * Client-side Price Oracle
 * Fetches prices from our backend API proxy (/api/prices)
 * which proxies requests to CoinGecko to avoid CORS issues
 */

export interface PriceData {
  symbol: string
  price: number
  change24h: number
  lastUpdated: Date
}

class PriceOracleClient {
  private cache: Map<string, { data: PriceData; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 60 * 1000 // 60 seconds

  async getPriceData(symbol: string): Promise<PriceData> {
    // Check cache first
    const cached = this.cache.get(symbol)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Use our backend API proxy to avoid CORS issues
      const coinId = this.symbolToCoinId(symbol)
      const response = await fetch(
        `/api/prices?ids=${coinId}`,
        { cache: 'no-store' }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch price for ${symbol}`)
      }

      const data = await response.json()

      if (!data[coinId]) {
        throw new Error(`Price not found for ${symbol}`)
      }

      const priceData: PriceData = {
        symbol,
        price: data[coinId].usd,
        change24h: data[coinId].usd_24h_change || 0,
        lastUpdated: new Date(),
      }

      // Update cache
      this.cache.set(symbol, { data: priceData, timestamp: Date.now() })

      return priceData
    } catch (error) {
      // Return cached data if available, even if stale
      if (cached) {
        return cached.data
      }
      // Don't log errors to avoid console spam
      throw error
    }
  }

  private symbolToCoinId(symbol: string): string {
    const mapping: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      USDT: 'tether',
      USDC: 'usd-coin',
      BNB: 'binancecoin',
      XRP: 'ripple',
      ADA: 'cardano',
      SOL: 'solana',
      DOT: 'polkadot',
      MATIC: 'matic-network',
      AVAX: 'avalanche-2',
      LINK: 'chainlink',
      UNI: 'uniswap',
      ATOM: 'cosmos',
      // Add more as needed
    }

    return mapping[symbol.toUpperCase()] || symbol.toLowerCase()
  }

  clearCache(): void {
    this.cache.clear()
  }
}

// Singleton instance
let instance: PriceOracleClient | null = null

export function getPriceOracle(): PriceOracleClient {
  if (!instance) {
    instance = new PriceOracleClient()
  }
  return instance
}
