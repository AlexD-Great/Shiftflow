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
  TIME_BASED = 'TIME_BASED',
  BALANCE_THRESHOLD = 'BALANCE_THRESHOLD',
  GAS_THRESHOLD = 'GAS_THRESHOLD',
  COMPOSITE_AND = 'COMPOSITE_AND',
  COMPOSITE_OR = 'COMPOSITE_OR',
}

export enum ActionType {
  CROSS_CHAIN_SWAP = 'CROSS_CHAIN_SWAP',
  NOTIFICATION = 'NOTIFICATION',
  WEBHOOK = 'WEBHOOK',
  MULTI_STEP = 'MULTI_STEP',
}

export interface PriceThresholdCondition {
  type: ConditionType.PRICE_THRESHOLD;
  token: string;
  comparison: 'above' | 'below';
  threshold: number;
  currency: string; // e.g., 'USD'
}

export interface TimeBasedCondition {
  type: ConditionType.TIME_BASED;
  schedule: 'daily' | 'weekly' | 'monthly' | 'cron';
  time?: string; // e.g., '09:00' or cron expression
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
}

export interface BalanceThresholdCondition {
  type: ConditionType.BALANCE_THRESHOLD;
  address: string;
  token: string;
  network: string;
  comparison: 'above' | 'below';
  threshold: string;
}

export interface GasThresholdCondition {
  type: ConditionType.GAS_THRESHOLD;
  network: string;
  comparison: 'above' | 'below';
  threshold: number; // in gwei
}

export interface CompositeAndCondition {
  type: ConditionType.COMPOSITE_AND;
  conditions: WorkflowCondition[];
}

export interface CompositeOrCondition {
  type: ConditionType.COMPOSITE_OR;
  conditions: WorkflowCondition[];
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

export interface NotificationAction {
  type: ActionType.NOTIFICATION;
  channel: 'email' | 'telegram' | 'discord';
  recipient: string;
  message: string;
}

export interface WebhookAction {
  type: ActionType.WEBHOOK;
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
}

export interface MultiStepAction {
  type: ActionType.MULTI_STEP;
  steps: WorkflowAction[];
  stopOnError?: boolean;
}

export type WorkflowCondition = 
  | PriceThresholdCondition 
  | TimeBasedCondition
  | BalanceThresholdCondition
  | GasThresholdCondition
  | CompositeAndCondition 
  | CompositeOrCondition;

export type WorkflowAction = 
  | CrossChainSwapAction 
  | NotificationAction
  | WebhookAction
  | MultiStepAction;

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
  // Smart Account integration
  safeAddress?: string; // If set, execute through Safe multi-sig
  requiresApproval?: boolean; // If true, needs multi-sig approval
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
