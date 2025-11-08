import axios, { AxiosInstance } from 'axios';

/**
 * Gas Oracle Service
 * Monitors gas prices across different networks using Etherscan-like APIs
 */
export class GasOracleService {
  private etherscanClient: AxiosInstance;
  private polygonscanClient: AxiosInstance;
  private arbiscanClient: AxiosInstance;
  private cache: Map<string, { price: number; timestamp: number }>;
  private cacheDuration: number = 30000; // 30 seconds

  constructor(
    private etherscanApiKey?: string,
    private polygonscanApiKey?: string,
    private arbiscanApiKey?: string
  ) {
    this.cache = new Map();

    // Etherscan for Ethereum mainnet
    this.etherscanClient = axios.create({
      baseURL: 'https://api.etherscan.io/api',
      params: {
        apikey: this.etherscanApiKey || 'YourApiKeyToken',
      },
    });

    // Polygonscan for Polygon
    this.polygonscanClient = axios.create({
      baseURL: 'https://api.polygonscan.com/api',
      params: {
        apikey: this.polygonscanApiKey || 'YourApiKeyToken',
      },
    });

    // Arbiscan for Arbitrum
    this.arbiscanClient = axios.create({
      baseURL: 'https://api.arbiscan.io/api',
      params: {
        apikey: this.arbiscanApiKey || 'YourApiKeyToken',
      },
    });
  }

  /**
   * Get current gas price for a network in gwei
   */
  async getGasPrice(network: string): Promise<number> {
    const normalizedNetwork = network.toLowerCase();
    
    // Check cache first
    const cached = this.cache.get(normalizedNetwork);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.price;
    }

    let gasPrice: number;

    try {
      switch (normalizedNetwork) {
        case 'ethereum':
        case 'eth':
        case 'mainnet':
          gasPrice = await this.getEthereumGasPrice();
          break;
        case 'polygon':
        case 'matic':
          gasPrice = await this.getPolygonGasPrice();
          break;
        case 'arbitrum':
        case 'arb':
          gasPrice = await this.getArbitrumGasPrice();
          break;
        default:
          // Fallback to Ethereum for unknown networks
          console.warn(`Unknown network: ${network}, using Ethereum gas price`);
          gasPrice = await this.getEthereumGasPrice();
      }

      // Cache the result
      this.cache.set(normalizedNetwork, {
        price: gasPrice,
        timestamp: Date.now(),
      });

      return gasPrice;
    } catch (error) {
      console.error(`Error fetching gas price for ${network}:`, error);
      // Return a high default value to prevent execution during errors
      return 999;
    }
  }

  /**
   * Get Ethereum gas price from Etherscan
   */
  private async getEthereumGasPrice(): Promise<number> {
    try {
      const response = await this.etherscanClient.get('', {
        params: {
          module: 'gastracker',
          action: 'gasoracle',
        },
      });

      if (response.data.status === '1' && response.data.result) {
        // Use SafeGasPrice (standard gas price)
        return parseFloat(response.data.result.SafeGasPrice);
      }

      throw new Error('Invalid response from Etherscan');
    } catch (error) {
      console.error('Etherscan API error:', error);
      // Fallback: use a reasonable default
      return 50; // 50 gwei default
    }
  }

  /**
   * Get Polygon gas price from Polygonscan
   */
  private async getPolygonGasPrice(): Promise<number> {
    try {
      const response = await this.polygonscanClient.get('', {
        params: {
          module: 'gastracker',
          action: 'gasoracle',
        },
      });

      if (response.data.status === '1' && response.data.result) {
        return parseFloat(response.data.result.SafeGasPrice);
      }

      throw new Error('Invalid response from Polygonscan');
    } catch (error) {
      console.error('Polygonscan API error:', error);
      return 100; // 100 gwei default for Polygon
    }
  }

  /**
   * Get Arbitrum gas price from Arbiscan
   */
  private async getArbitrumGasPrice(): Promise<number> {
    try {
      const response = await this.arbiscanClient.get('', {
        params: {
          module: 'gastracker',
          action: 'gasoracle',
        },
      });

      if (response.data.status === '1' && response.data.result) {
        return parseFloat(response.data.result.SafeGasPrice);
      }

      throw new Error('Invalid response from Arbiscan');
    } catch (error) {
      console.error('Arbiscan API error:', error);
      return 0.1; // Very low default for Arbitrum (typically < 1 gwei)
    }
  }

  /**
   * Get gas prices for multiple networks at once
   */
  async getMultipleGasPrices(networks: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    
    await Promise.all(
      networks.map(async (network) => {
        prices[network] = await this.getGasPrice(network);
      })
    );

    return prices;
  }

  /**
   * Check if current gas price meets a threshold condition
   */
  async checkGasCondition(
    network: string,
    comparison: 'above' | 'below',
    threshold: number
  ): Promise<boolean> {
    const currentGas = await this.getGasPrice(network);
    
    console.log(`[GasOracle] ${network} gas: ${currentGas} gwei (threshold: ${threshold} gwei, ${comparison})`);

    if (comparison === 'below') {
      return currentGas < threshold;
    } else {
      return currentGas > threshold;
    }
  }

  /**
   * Get recommended gas price tier
   */
  async getRecommendedGas(network: string): Promise<{
    slow: number;
    standard: number;
    fast: number;
  }> {
    const normalizedNetwork = network.toLowerCase();

    try {
      let response;
      
      switch (normalizedNetwork) {
        case 'ethereum':
        case 'eth':
        case 'mainnet':
          response = await this.etherscanClient.get('', {
            params: {
              module: 'gastracker',
              action: 'gasoracle',
            },
          });
          break;
        case 'polygon':
        case 'matic':
          response = await this.polygonscanClient.get('', {
            params: {
              module: 'gastracker',
              action: 'gasoracle',
            },
          });
          break;
        case 'arbitrum':
        case 'arb':
          response = await this.arbiscanClient.get('', {
            params: {
              module: 'gastracker',
              action: 'gasoracle',
            },
          });
          break;
        default:
          throw new Error(`Unsupported network: ${network}`);
      }

      if (response.data.status === '1' && response.data.result) {
        return {
          slow: parseFloat(response.data.result.SafeGasPrice),
          standard: parseFloat(response.data.result.ProposeGasPrice),
          fast: parseFloat(response.data.result.FastGasPrice),
        };
      }

      throw new Error('Invalid API response');
    } catch (error) {
      console.error(`Error getting recommended gas for ${network}:`, error);
      // Return reasonable defaults
      return {
        slow: 30,
        standard: 50,
        fast: 70,
      };
    }
  }

  /**
   * Clear the cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }
}
