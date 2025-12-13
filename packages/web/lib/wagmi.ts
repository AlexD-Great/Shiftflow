import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// WalletConnect Project ID - optional, only enable if configured
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Build connectors array - only include WalletConnect if projectId is configured
const connectors = [injected()]
if (projectId) {
  connectors.push(walletConnect({ projectId }))
}

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
