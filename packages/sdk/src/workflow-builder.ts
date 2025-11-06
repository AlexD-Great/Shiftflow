import {
  Workflow,
  WorkflowCondition,
  WorkflowAction,
  ConditionType,
  ActionType,
  PriceThresholdCondition,
  CrossChainSwapAction,
} from '@shiftflow/engine';

/**
 * Fluent API for building workflows
 */
export class WorkflowBuilder {
  private workflow: Partial<Workflow>;

  constructor() {
    this.workflow = {
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      actions: [],
    };
  }

  /**
   * Set workflow ID
   */
  id(id: string): this {
    this.workflow.id = id;
    return this;
  }

  /**
   * Set workflow name
   */
  name(name: string): this {
    this.workflow.name = name;
    return this;
  }

  /**
   * Set workflow description
   */
  description(description: string): this {
    this.workflow.description = description;
    return this;
  }

  /**
   * Set user ID
   */
  userId(userId: string): this {
    this.workflow.userId = userId;
    return this;
  }

  /**
   * Add price threshold condition
   */
  whenPriceIs(
    token: string,
    comparison: 'above' | 'below',
    threshold: number,
    currency: string = 'USD'
  ): this {
    const condition: PriceThresholdCondition = {
      type: ConditionType.PRICE_THRESHOLD,
      token,
      comparison,
      threshold,
      currency,
    };
    this.workflow.condition = condition;
    return this;
  }

  /**
   * Add cross-chain swap action
   */
  thenSwap(params: {
    amount: string;
    fromCoin: string;
    fromNetwork: string;
    toCoin: string;
    toNetwork: string;
    toAddress: string;
  }): this {
    const action: CrossChainSwapAction = {
      type: ActionType.CROSS_CHAIN_SWAP,
      depositCoin: params.fromCoin,
      depositNetwork: params.fromNetwork,
      settleCoin: params.toCoin,
      settleNetwork: params.toNetwork,
      amount: params.amount,
      settleAddress: params.toAddress,
    };
    
    if (!this.workflow.actions) {
      this.workflow.actions = [];
    }
    this.workflow.actions.push(action);
    return this;
  }

  /**
   * Build and validate the workflow
   */
  build(): Workflow {
    if (!this.workflow.id) {
      throw new Error('Workflow ID is required');
    }
    if (!this.workflow.name) {
      throw new Error('Workflow name is required');
    }
    if (!this.workflow.userId) {
      throw new Error('User ID is required');
    }
    if (!this.workflow.condition) {
      throw new Error('Workflow condition is required');
    }
    if (!this.workflow.actions || this.workflow.actions.length === 0) {
      throw new Error('At least one action is required');
    }

    return this.workflow as Workflow;
  }
}

/**
 * Create a new workflow builder
 */
export function createWorkflow(): WorkflowBuilder {
  return new WorkflowBuilder();
}
