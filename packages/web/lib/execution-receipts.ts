import { keccak256, stringToHex, createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

type ExecutionReceiptStatus = 'SUCCESS' | 'FAILED';

export type ExecutionReceipt = {
  id: string;
  workflowId: string;
  type: string;
  timestamp: string;
  conditionSnapshot: unknown;
  actionsSnapshot: unknown;
  txHash?: string;
  status: ExecutionReceiptStatus;
  error?: string;
} & Record<string, unknown>;

export interface ReceiptResult {
  receipt: ExecutionReceipt;
  receiptHash: string;
  anchorTxHash?: string;
}

const RECEIPT_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'logReceipt',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'hash', type: 'bytes32' }],
    outputs: [],
  },
] as const;

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${stableSerialize(objectValue[key])}`);
  return `{${entries.join(',')}}`;
}

export function hashExecutionReceipt(receipt: ExecutionReceipt): string {
  return keccak256(stringToHex(stableSerialize(receipt)));
}

function getChainConfig() {
  const chainId = Number(process.env.RECEIPT_EVM_CHAIN_ID || process.env.FLOW_EVM_CHAIN_ID || 1);
  const rpcUrl = process.env.RECEIPT_EVM_RPC_URL || process.env.FLOW_EVM_RPC_URL;

  if (!rpcUrl) {
    return null;
  }

  return {
    id: chainId,
    name: 'Receipt EVM Chain',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
      public: {
        http: [rpcUrl],
      },
    },
  } as const;
}

export async function anchorReceiptOnChain(receiptHash: string): Promise<string | undefined> {
  const registryAddress = process.env.RECEIPT_REGISTRY_ADDRESS as `0x${string}` | undefined;
  const privateKey = process.env.RECEIPT_ANCHOR_PRIVATE_KEY as `0x${string}` | undefined;
  const chain = getChainConfig();

  if (!registryAddress || !privateKey || !chain) {
    return undefined;
  }

  const account = privateKeyToAccount(privateKey);
  const transport = http(chain.rpcUrls.default.http[0]);

  const walletClient = createWalletClient({
    account,
    chain,
    transport,
  });

  const publicClient = createPublicClient({
    chain,
    transport,
  });

  const txHash = await walletClient.writeContract({
    address: registryAddress,
    abi: RECEIPT_REGISTRY_ABI,
    functionName: 'logReceipt',
    args: [receiptHash as `0x${string}`],
    account,
    chain,
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

export async function createExecutionReceipt(input: {
  workflowId: string;
  type: string;
  conditionSnapshot: unknown;
  actionsSnapshot: unknown;
  status: ExecutionReceiptStatus;
  txHash?: string;
  error?: string;
}): Promise<ReceiptResult> {
  const receipt: ExecutionReceipt = {
    id: `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    workflowId: input.workflowId,
    type: input.type,
    timestamp: new Date().toISOString(),
    conditionSnapshot: input.conditionSnapshot,
    actionsSnapshot: input.actionsSnapshot,
    txHash: input.txHash,
    status: input.status,
    error: input.error,
  };

  const receiptHash = hashExecutionReceipt(receipt);
  const anchorTxHash = await anchorReceiptOnChain(receiptHash);

  return {
    receipt,
    receiptHash,
    anchorTxHash,
  };
}
