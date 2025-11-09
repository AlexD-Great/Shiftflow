/**
 * Price Oracle Service
 * Fetches real-time cryptocurrency prices from CoinGecko API
 */

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export interface PriceData {
  symbol: string
  price: number
  change24h: number
  lastUpdated: number
}

export interface CoinGeckoPriceResponse {
  [coinId: string]: {
    usd: number
    usd_24h_change: number
  }
}

/**
 * Price Oracle Service
 */
export class PriceOracle {
  private cache: Map<string, { data: PriceData; timestamp: number }> = new Map()
  private cacheDuration = 60000 // 1 minute cache

  // Map common symbols to CoinGecko IDs
  private symbolToId: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    USDC: 'usd-coin',
    BNB: 'binancecoin',
    XRP: 'ripple',
    ADA: 'cardano',
    SOL: 'solana',
    DOGE: 'dogecoin',
    MATIC: 'matic-network',
    DOT: 'polkadot',
    AVAX: 'avalanche-2',
    LINK: 'chainlink',
    UNI: 'uniswap',
    ATOM: 'cosmos',
  }

  /**
   * Get current price for a symbol
   */
  async getPrice(symbol: string): Promise<number> {
    const data = await this.getPriceData(symbol)
    return data.price
  }

  /**
   * Get detailed price data for a symbol
   */
  async getPriceData(symbol: string): Promise<PriceData> {
    const upperSymbol = symbol.toUpperCase()

    // Check cache
    const cached = this.cache.get(upperSymbol)
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data
    }

    // Fetch from API
    const coinId = this.symbolToId[upperSymbol]
    if (!coinId) {
      throw new Error(`Unsupported symbol: ${symbol}`)
    }

    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`)
      }

      const data: CoinGeckoPriceResponse = await response.json()
      const coinData = data[coinId]

      if (!coinData) {
        throw new Error(`No data for ${symbol}`)
      }

      const priceData: PriceData = {
        symbol: upperSymbol,
        price: coinData.usd,
        change24h: coinData.usd_24h_change || 0,
        lastUpdated: Date.now(),
      }

      // Update cache
      this.cache.set(upperSymbol, {
        data: priceData,
        timestamp: Date.now(),
      })

      return priceData
    } catch (error) {
      console.error(`[PriceOracle] Error fetching price for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Get prices for multiple symbols
   */
  async getPrices(symbols: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {}

    // Get unique coin IDs
    const coinIds = symbols
      .map(s => this.symbolToId[s.toUpperCase()])
      .filter(Boolean)

    if (coinIds.length === 0) {
      return prices
    }

    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`)
      }

      const data: CoinGeckoPriceResponse = await response.json()

      // Map back to symbols
      symbols.forEach(symbol => {
        const upperSymbol = symbol.toUpperCase()
        const coinId = this.symbolToId[upperSymbol]
        if (coinId && data[coinId]) {
          prices[upperSymbol] = data[coinId].usd
        }
      })

      return prices
    } catch (error) {
      console.error('[PriceOracle] Error fetching multiple prices:', error)
      throw error
    }
  }

  /**
   * Get exchange rate between two assets
   */
  async getRate(fromSymbol: string, toSymbol: string): Promise<number> {
    if (toSymbol.toUpperCase() === 'USD') {
      return await this.getPrice(fromSymbol)
    }

    const [fromPrice, toPrice] = await Promise.all([
      this.getPrice(fromSymbol),
      this.getPrice(toSymbol),
    ])

    return fromPrice / toPrice
  }

  /**
   * Check if price condition is met
   */
  async checkPriceCondition(
    symbol: string,
    comparison: 'above' | 'below',
    threshold: number
  ): Promise<boolean> {
    const currentPrice = await this.getPrice(symbol)

    if (comparison === 'above') {
      return currentPrice > threshold
    } else {
      return currentPrice < threshold
    }
  }

  /**
   * Get price for a trading pair (e.g., "ETH/BTC")
   */
  async getPairPrice(pair: string): Promise<number> {
    const [base, quote] = pair.split('/').map(s => s.trim())
    
    if (!base || !quote) {
      throw new Error(`Invalid pair format: ${pair}`)
    }

    return await this.getRate(base, quote)
  }

  /**
   * Get all cached prices
   */
  getCachedPrices(): Record<string, PriceData> {
    const prices: Record<string, PriceData> = {}
    
    this.cache.forEach((value, key) => {
      // Only return non-stale data
      if (Date.now() - value.timestamp < this.cacheDuration) {
        prices[key] = value.data
      }
    })

    return prices
  }

  /**
   * Clear price cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Add custom symbol mapping
   */
  addSymbolMapping(symbol: string, coinGeckoId: string) {
    this.symbolToId[symbol.toUpperCase()] = coinGeckoId
  }
}

// Singleton instance
let priceOracleInstance: PriceOracle | null = null

export function getPriceOracle(): PriceOracle {
  if (!priceOracleInstance) {
    priceOracleInstance = new PriceOracle()
  }
  return priceOracleInstance
}

/**
 * Format price for display
 */
export function formatPrice(price: number, decimals: number = 2): string {
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
  } else if (price >= 1) {
    return `$${price.toFixed(decimals)}`
  } else {
    // For prices < $1, show more decimals
    return `$${price.toFixed(6)}`
  }
}

/**
 * Format price change percentage
 */
export function formatPriceChange(change: number): {
  text: string
  color: string
  isPositive: boolean
} {
  const isPositive = change >= 0
  return {
    text: `${isPositive ? '+' : ''}${change.toFixed(2)}%`,
    color: isPositive ? 'green' : 'red',
    isPositive,
  }
}
