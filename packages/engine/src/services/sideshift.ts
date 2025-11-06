import axios, { AxiosInstance } from 'axios';
import {
  QuoteRequest,
  QuoteResponse,
  ShiftRequest,
  ShiftResponse,
  Coin,
  QuoteResponseSchema,
  ShiftResponseSchema,
} from '../types';

export class SideShiftService {
  private client: AxiosInstance;
  private secret: string;
  private affiliateId: string;

  constructor(secret: string, affiliateId: string) {
    this.secret = secret;
    this.affiliateId = affiliateId;
    
    this.client = axios.create({
      baseURL: 'https://sideshift.ai/api/v2',
      headers: {
        'Content-Type': 'application/json',
        'x-sideshift-secret': this.secret,
      },
    });
  }

  /**
   * Get list of available coins and networks
   */
  async getCoins(): Promise<Coin[]> {
    const response = await this.client.get('/coins');
    return response.data;
  }

  /**
   * Request a quote for a swap
   */
  async requestQuote(params: Omit<QuoteRequest, 'affiliateId'>): Promise<QuoteResponse> {
    const response = await this.client.post('/quotes', {
      ...params,
      affiliateId: this.affiliateId,
    });
    
    return QuoteResponseSchema.parse(response.data);
  }

  /**
   * Create a fixed shift from a quote
   */
  async createFixedShift(params: Omit<ShiftRequest, 'affiliateId'>): Promise<ShiftResponse> {
    const response = await this.client.post('/shifts/fixed', {
      ...params,
      affiliateId: this.affiliateId,
    });
    
    return ShiftResponseSchema.parse(response.data);
  }

  /**
   * Get shift status by ID
   */
  async getShiftStatus(shiftId: string): Promise<ShiftResponse> {
    const response = await this.client.get(`/shifts/${shiftId}`);
    return ShiftResponseSchema.parse(response.data);
  }

  /**
   * Monitor a shift until completion or timeout
   * @param shiftId - The shift ID to monitor
   * @param timeoutMs - Maximum time to wait (default: 30 minutes)
   * @param pollIntervalMs - How often to check status (default: 10 seconds)
   */
  async monitorShift(
    shiftId: string,
    timeoutMs: number = 30 * 60 * 1000,
    pollIntervalMs: number = 10000
  ): Promise<ShiftResponse> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const shift = await this.getShiftStatus(shiftId);
      
      // Terminal states
      if (shift.status === 'settled' || shift.status === 'refunded') {
        return shift;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
    
    throw new Error(`Shift monitoring timed out after ${timeoutMs}ms`);
  }

  /**
   * Execute a complete swap workflow: quote -> shift -> monitor
   */
  async executeSwap(params: {
    depositCoin: string;
    depositNetwork: string;
    settleCoin: string;
    settleNetwork: string;
    depositAmount: string;
    settleAddress: string;
    refundAddress?: string;
  }): Promise<{
    quote: QuoteResponse;
    shift: ShiftResponse;
    finalStatus: ShiftResponse;
  }> {
    // Step 1: Request quote
    const quote = await this.requestQuote({
      depositCoin: params.depositCoin,
      depositNetwork: params.depositNetwork,
      settleCoin: params.settleCoin,
      settleNetwork: params.settleNetwork,
      depositAmount: params.depositAmount,
    });

    // Step 2: Create fixed shift
    const shift = await this.createFixedShift({
      quoteId: quote.id,
      settleAddress: params.settleAddress,
      refundAddress: params.refundAddress,
    });

    // Step 3: Monitor until completion
    const finalStatus = await this.monitorShift(shift.id);

    return { quote, shift, finalStatus };
  }
}
