'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { signIn, signOut, useSession } from 'next-auth/react'

export function WalletAuth() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: session, status } = useSession()
  const { signMessageAsync } = useSignMessage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create simple message to sign
      const message = `Sign in to ShiftFlow\n\nAddress: ${address}\nNonce: ${Math.random().toString(36).substring(7)}`

      // Sign the message
      const signature = await signMessageAsync({
        message,
      })

      // Authenticate with NextAuth
      const result = await signIn('wallet', {
        message,
        signature,
        address,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        // Success - session will update automatically
        setError(null)
      } else {
        setError('Authentication failed')
      }
    } catch (err: any) {
      // Don't log to console to avoid error spam
      if (err.message?.includes('User rejected')) {
        setError('Signature rejected')
      } else {
        setError('Failed to sign in. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>Loading...</span>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-green-600/20 border border-green-600 text-green-300 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Connect {connector.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
      >
        {isLoading ? 'Signing In...' : 'Sign In with Wallet'}
      </button>
      {error && (
        <div className="px-3 py-2 bg-red-900/20 border border-red-700 text-red-300 rounded-lg text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
