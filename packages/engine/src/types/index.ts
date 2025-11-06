import { z } from 'zod';

// ============================================================================
// SideShift API Types (Based on official docs)
// ============================================================================

export const CoinSchema = z.object({
  coin: z.string(),
  network: z.string(),
  name: z.string(),
  depositOffline: z.boolean().optional(),
  settleOffline: z.boolean().optional(),
});

export const QuoteRequestSchema = z.object({
  depositCoin: z.string(),
  depositNetwork: z.string(),
  settleCoin: z.string(),
  settleNetwork: z.string(),
  depositAmount: z.string().optional(),
  settleAmount: z.string().optional(),
  affiliateId: z.string(),
});

export const QuoteResponseSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  depositCoin: z.string(),
  depositNetwork: z.string(),
  settleCoin: z.string(),
  settleNetwork: z.string(),
  depositAmount: z.string(),
  settleAmount: z.string(),
  expiresAt: z.string(),
  rate: z.string(),
});

export const ShiftRequestSchema = z.object({
  quoteId: z.string(),
  settleAddress: z.string(),
  affiliateId: z.string(),
  refundAddress: z.string().optional(),
});

export const ShiftResponseSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  depositCoin: z.string(),
  depositNetwork: z.string(),
  settleCoin: z.string(),
  settleNetwork: z.string(),
  depositAddress: z.string(),
  settleAddress: z.string(),
  depositAmount: z.string(),
  settleAmount: z.string(),
  expiresAt: z.string(),
  status: z.enum(['waiting', 'processing', 'settling', 'settled', 'refunding', 'refunded']),
  rate: z.string().optional(),
});

export type Coin = z.infer<typeof CoinSchema>;
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;
export type ShiftRequest = z.infer<typeof ShiftRequestSchema>;
export type ShiftResponse = z.infer<typeof ShiftResponseSchema>;

// ============================================================================
// Workflow Types
// ============================================================================

export enum ConditionType {
  PRICE_THRESHOLD = 'PRICE_THRESHOLD',
  LIQUIDITY_POOL = 'LIQUIDITY_POOL',
  TIME_BASED = 'TIME_BASED',
  AI_SIGNAL = 'AI_SIGNAL',
}

export enum ActionType {
  CROSS_CHAIN_SWAP = 'CROSS_CHAIN_SWAP',
  LIQUIDITY_DEPOSIT = 'LIQUIDITY_DEPOSIT',
  TOKEN_TRANSFER = 'TOKEN_TRANSFER',
}

export interface PriceThresholdCondition {
  type: ConditionType.PRICE_THRESHOLD;
  token: string;
  comparison: 'above' | 'below';
  threshold: number;
  currency: string; // e.g., 'USD'
}

export interface CrossChainSwapAction {
  type: ActionType.CROSS_CHAIN_SWAP;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  amount: string;
  settleAddress: string;
}

export type WorkflowCondition = PriceThresholdCondition;
export type WorkflowAction = CrossChainSwapAction;

export interface Workflow {
  id: string;
  name: string;
  description: string;
  userId: string;
  condition: WorkflowCondition;
  actions: WorkflowAction[];
  status: 'active' | 'paused' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  lastCheckedAt?: Date;
  executionCount: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  steps: ExecutionStep[];
}

export interface ExecutionStep {
  id: string;
  type: 'condition_check' | 'quote_request' | 'shift_create' | 'shift_monitor';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  data?: any;
  error?: string;
  timestamp: Date;
}
