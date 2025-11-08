import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import Safe from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'

interface SafeInfo {
  address: string
  owners: string[]
  threshold: number
  nonce: number
  balance: string
}

export function useSafe() {
  const { address, isConnected, chain } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [safeInfo, setSafeInfo] = useState<SafeInfo | null>(null)

  const loadSafeInfo = async (safeAddress: string) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use a public RPC provider for reading Safe data
      const provider = publicClient?.transport?.url || 'https://eth.llamarpc.com'
      
      // Initialize Safe Protocol Kit
      const protocolKit = await Safe.init({
        provider,
        signer: address,
        safeAddress,
      })

      // Get Safe info
      const owners = await protocolKit.getOwners()
      const threshold = await protocolKit.getThreshold()
      const nonce = await protocolKit.getNonce()

      // Get balance using public client
      let balance = '0 ETH'
      if (publicClient) {
        const balanceWei = await publicClient.getBalance({
          address: safeAddress as `0x${string}`,
        })
        balance = `${(Number(balanceWei) / 1e18).toFixed(4)} ETH`
      }

      const info: SafeInfo = {
        address: safeAddress,
        owners,
        threshold,
        nonce,
        balance,
      }

      setSafeInfo(info)
      return info
    } catch (err: any) {
      console.error('Error loading Safe:', err)
      
      let errorMessage = 'Failed to load Safe data.'
      
      if (err.message?.includes('SafeProxy contract is not deployed')) {
        errorMessage = `This Safe address is not deployed on ${chain?.name || 'this network'}. Please check:\n• The Safe address is correct\n• You're connected to the right network (Ethereum Mainnet, Sepolia, etc.)\n• The Safe exists on this network`
      } else if (err.message?.includes('Invalid address')) {
        errorMessage = 'Invalid Safe address format. Please enter a valid Ethereum address.'
      } else {
        errorMessage = err.message || 'Failed to load Safe data. Please check the address and network.'
      }
      
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (to: string, value: string, data: string = '0x') => {
    if (!safeInfo || !address || !isConnected) {
      setError('Safe not loaded or wallet not connected')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const provider = publicClient?.transport?.url || 'https://eth.llamarpc.com'
      
      const protocolKit = await Safe.init({
        provider,
        signer: address,
        safeAddress: safeInfo.address,
      })

      // Create transaction
      const safeTransaction = await protocolKit.createTransaction({
        transactions: [
          {
            to,
            value,
            data,
          },
        ],
      })

      // Sign transaction
      const signedTx = await protocolKit.signTransaction(safeTransaction)

      return {
        transaction: safeTransaction,
        signature: signedTx,
      }
    } catch (err: any) {
      console.error('Error creating transaction:', err)
      setError(err.message || 'Failed to create transaction')
      return null
    } finally {
      setLoading(false)
    }
  }

  const proposeTransaction = async (
    to: string,
    value: string,
    data: string = '0x',
    chainId: number = 1
  ) => {
    if (!safeInfo || !address || !isConnected) {
      setError('Safe not loaded or wallet not connected')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const provider = publicClient?.transport?.url || 'https://eth.llamarpc.com'

      // Initialize API Kit
      const apiKit = new SafeApiKit({
        chainId: BigInt(chainId),
      })

      const protocolKit = await Safe.init({
        provider,
        signer: address,
        safeAddress: safeInfo.address,
      })

      // Create and sign transaction
      const safeTransaction = await protocolKit.createTransaction({
        transactions: [
          {
            to,
            value,
            data,
          },
        ],
      })

      const safeTxHash = await protocolKit.getTransactionHash(safeTransaction)
      const signature = await protocolKit.signHash(safeTxHash)

      // Propose transaction to Safe service
      await apiKit.proposeTransaction({
        safeAddress: safeInfo.address,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: address,
        senderSignature: signature.data,
      })

      return {
        safeTxHash,
        transaction: safeTransaction,
      }
    } catch (err: any) {
      console.error('Error proposing transaction:', err)
      setError(err.message || 'Failed to propose transaction')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    safeInfo,
    loading,
    error,
    loadSafeInfo,
    createTransaction,
    proposeTransaction,
    isConnected,
  }
}
