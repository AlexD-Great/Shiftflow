/**
 * Price Oracle Service
 * Fetches and caches cryptocurrency prices from CoinGecko
 */

interface PriceData {
  coinId: string;
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export class PriceOracleService {
  private static instance: PriceOracleService;
  private cache: Map<string, PriceData> = new Map();
  private readonly CACHE_DURATION = 60 * 1000; // 60 seconds
  private readonly COINGECKO_API = "https://api.coingecko.com/api/v3";

  private constructor() {}

  static getInstance(): PriceOracleService {
    if (!PriceOracleService.instance) {
      PriceOracleService.instance = new PriceOracleService();
    }
    return PriceOracleService.instance;
  }

  /**
   * Get current price for a coin
   * Uses cache if available and fresh
   */
  async getPrice(coinId: string): Promise<number | null> {
    // Check cache first
    const cached = this.cache.get(coinId);
    if (cached && Date.now() - cached.lastUpdated.getTime() < this.CACHE_DURATION) {
      console.log(`[Price Oracle] Cache hit for ${coinId}: $${cached.price}`);
      return cached.price;
    }

    // Fetch from CoinGecko
    try {
      const apiKey = process.env.COINGECKO_API_KEY;
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey;
      }

      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data[coinId]) {
        console.error(`[Price Oracle] Coin not found: ${coinId}`);
        return null;
      }

      const priceData: PriceData = {
        coinId,
        symbol: coinId,
        price: data[coinId].usd,
        change24h: data[coinId].usd_24h_change || 0,
        lastUpdated: new Date(),
      };

      // Update cache
      this.cache.set(coinId, priceData);

      console.log(`[Price Oracle] Fetched ${coinId}: $${priceData.price}`);
      return priceData.price;
    } catch (error) {
      console.error(`[Price Oracle] Error fetching price for ${coinId}:`, error);
      return null;
    }
  }

  /**
   * Get prices for multiple coins
   */
  async getPrices(coinIds: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();

    await Promise.all(
      coinIds.map(async (coinId) => {
        const price = await this.getPrice(coinId);
        if (price !== null) {
          prices.set(coinId, price);
        }
      })
    );

    return prices;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    console.log("[Price Oracle] Cache cleared");
  }
}
