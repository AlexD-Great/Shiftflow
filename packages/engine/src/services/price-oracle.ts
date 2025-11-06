import axios from 'axios';

export interface PriceData {
  token: string;
  price: number;
  currency: string;
  timestamp: Date;
}

export class PriceOracleService {
  private coingeckoApiKey?: string;

  constructor(coingeckoApiKey?: string) {
    this.coingeckoApiKey = coingeckoApiKey;
  }

  /**
   * Get current price for a token
   * Uses CoinGecko API (free tier available)
   */
  async getPrice(token: string, currency: string = 'usd'): Promise<PriceData> {
    try {
      const tokenId = this.mapTokenToCoinGeckoId(token);
      
      const url = 'https://api.coingecko.com/api/v3/simple/price';
      const params = {
        ids: tokenId,
        vs_currencies: currency.toLowerCase(),
      };

      const headers = this.coingeckoApiKey
        ? { 'x-cg-pro-api-key': this.coingeckoApiKey }
        : {};

      const response = await axios.get(url, { params, headers });
      
      const price = response.data[tokenId]?.[currency.toLowerCase()];
      
      if (!price) {
        throw new Error(`Price not found for ${token} in ${currency}`);
      }

      return {
        token,
        price,
        currency: currency.toUpperCase(),
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch price for ${token}: ${error}`);
    }
  }

  /**
   * Map common token symbols to CoinGecko IDs
   */
  private mapTokenToCoinGeckoId(token: string): string {
    const mapping: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'DAI': 'dai',
      'MATIC': 'matic-network',
      'ARB': 'arbitrum',
      'OP': 'optimism',
      'AVAX': 'avalanche-2',
      'SOL': 'solana',
      'BNB': 'binancecoin',
    };

    return mapping[token.toUpperCase()] || token.toLowerCase();
  }

  /**
   * Check if price meets threshold condition
   */
  async checkPriceThreshold(
    token: string,
    comparison: 'above' | 'below',
    threshold: number,
    currency: string = 'usd'
  ): Promise<{ met: boolean; currentPrice: number }> {
    const priceData = await this.getPrice(token, currency);
    
    const met = comparison === 'above'
      ? priceData.price > threshold
      : priceData.price < threshold;

    return {
      met,
      currentPrice: priceData.price,
    };
  }
}
