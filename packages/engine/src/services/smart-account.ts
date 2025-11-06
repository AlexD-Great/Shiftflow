import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import { ethers } from 'ethers';
import { SideShiftService } from './sideshift';

export interface SmartAccountConfig {
  safeAddress: string;
  ownerPrivateKey: string;
  rpcUrl: string;
  chainId: number;
}

export interface SafeTransaction {
  to: string;
  value: string;
  data: string;
  operation?: number;
}

/**
 * Smart Account Service for executing workflows through Safe (Gnosis Safe)
 * 
 * This enables:
 * - Multi-sig workflows (require multiple approvals)
 * - Gasless transactions (relayer pays gas)
 * - Enhanced security (funds stay in Safe)
 * - Programmable execution logic
 */
export class SmartAccountService {
  private safeAddress: string;
  private ethAdapter: EthersAdapter;
  private safeApiKit: SafeApiKit;
  private signer: ethers.Wallet;
  private chainId: number;

  constructor(config: SmartAccountConfig) {
    this.safeAddress = config.safeAddress;
    this.chainId = config.chainId;

    // Initialize ethers provider and signer
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.signer = new ethers.Wallet(config.ownerPrivateKey, provider);

    // Initialize Safe SDK
    this.ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signer,
    });

    // Initialize Safe API Kit for transaction service
    this.safeApiKit = new SafeApiKit({
      chainId: BigInt(config.chainId),
    });
  }

  /**
   * Get Safe instance
   */
  private async getSafe(): Promise<Safe> {
    return await Safe.create({
      ethAdapter: this.ethAdapter,
      safeAddress: this.safeAddress,
    });
  }

  /**
   * Get Safe balance
   */
  async getBalance(tokenAddress?: string): Promise<string> {
    const safe = await this.getSafe();
    
    if (!tokenAddress) {
      // Get native token balance (ETH)
      const balance = await safe.getBalance();
      return ethers.formatEther(balance);
    } else {
      // Get ERC20 token balance
      const erc20 = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        this.signer
      );
      const balance = await erc20.balanceOf(this.safeAddress);
      return ethers.formatUnits(balance, 18);
    }
  }

  /**
   * Get Safe owners (signers)
   */
  async getOwners(): Promise<string[]> {
    const safe = await this.getSafe();
    return await safe.getOwners();
  }

  /**
   * Get Safe threshold (number of signatures required)
   */
  async getThreshold(): Promise<number> {
    const safe = await this.getSafe();
    return await safe.getThreshold();
  }

  /**
   * Check if address is an owner
   */
  async isOwner(address: string): Promise<boolean> {
    const safe = await this.getSafe();
    return await safe.isOwner(address);
  }

  /**
   * Create and propose a Safe transaction
   * 
   * For multi-sig Safes, this creates a transaction that needs approval
   * from other owners before execution
   */
  async proposeTransaction(
    transaction: SafeTransaction,
    description?: string
  ): Promise<{
    safeTxHash: string;
    threshold: number;
    confirmations: number;
  }> {
    const safe = await this.getSafe();

    // Create Safe transaction
    const safeTransaction = await safe.createTransaction({
      transactions: [transaction],
    });

    // Sign transaction
    const safeTxHash = await safe.getTransactionHash(safeTransaction);
    const signature = await safe.signHash(safeTxHash);

    // Propose to Safe Transaction Service
    await this.safeApiKit.proposeTransaction({
      safeAddress: this.safeAddress,
      safeTransactionData: safeTransaction.data,
      safeTxHash,
      senderAddress: await this.signer.getAddress(),
      senderSignature: signature.data,
      origin: description || 'ShiftFlow Workflow',
    });

    const threshold = await this.getThreshold();

    return {
      safeTxHash,
      threshold,
      confirmations: 1, // Current signer has confirmed
    };
  }

  /**
   * Execute a Safe transaction (if threshold is met)
   */
  async executeTransaction(safeTxHash: string): Promise<string> {
    const safe = await this.getSafe();

    // Get transaction from service
    const transaction = await this.safeApiKit.getTransaction(safeTxHash);

    // Check if threshold is met
    const threshold = await this.getThreshold();
    if (transaction.confirmations.length < threshold) {
      throw new Error(
        `Insufficient confirmations: ${transaction.confirmations.length}/${threshold}`
      );
    }

    // Execute transaction
    const executeTxResponse = await safe.executeTransaction(transaction);
    const receipt = await executeTxResponse.transactionResponse?.wait();

    if (!receipt?.hash) {
      throw new Error('Transaction execution failed');
    }

    return receipt.hash;
  }

  /**
   * Execute SideShift swap through Safe
   * 
   * This creates a transaction that:
   * 1. Gets SideShift quote
   * 2. Creates shift
   * 3. Transfers tokens to SideShift deposit address
   */
  async executeSideShiftSwap(
    sideshift: SideShiftService,
    params: {
      depositCoin: string;
      depositNetwork: string;
      settleCoin: string;
      settleNetwork: string;
      amount: string;
      settleAddress: string;
    }
  ): Promise<{
    safeTxHash: string;
    shiftId: string;
    depositAddress: string;
  }> {
    // Step 1: Get quote from SideShift
    const quote = await sideshift.requestQuote({
      depositCoin: params.depositCoin,
      depositNetwork: params.depositNetwork,
      settleCoin: params.settleCoin,
      settleNetwork: params.settleNetwork,
      depositAmount: params.amount,
    });

    // Step 2: Create fixed shift
    const shift = await sideshift.createFixedShift({
      quoteId: quote.id,
      settleAddress: params.settleAddress,
    });

    // Step 3: Create Safe transaction to send tokens to SideShift
    // Note: This is a simplified version. In production, you'd need to:
    // - Get token contract address for the deposit coin
    // - Create ERC20 transfer transaction
    // - Handle native token transfers differently

    const transaction: SafeTransaction = {
      to: shift.depositAddress,
      value: ethers.parseEther(params.amount).toString(),
      data: '0x', // Empty data for native token transfer
    };

    const result = await this.proposeTransaction(
      transaction,
      `ShiftFlow: Swap ${params.amount} ${params.depositCoin} → ${params.settleCoin}`
    );

    return {
      safeTxHash: result.safeTxHash,
      shiftId: shift.id,
      depositAddress: shift.depositAddress,
    };
  }

  /**
   * Get pending transactions for the Safe
   */
  async getPendingTransactions(): Promise<any[]> {
    const pendingTxs = await this.safeApiKit.getPendingTransactions(
      this.safeAddress
    );
    return pendingTxs.results;
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(safeTxHash: string): Promise<{
    confirmations: number;
    threshold: number;
    isExecuted: boolean;
    canExecute: boolean;
  }> {
    const transaction = await this.safeApiKit.getTransaction(safeTxHash);
    const threshold = await this.getThreshold();

    return {
      confirmations: transaction.confirmations.length,
      threshold,
      isExecuted: transaction.isExecuted,
      canExecute: transaction.confirmations.length >= threshold && !transaction.isExecuted,
    };
  }
}
