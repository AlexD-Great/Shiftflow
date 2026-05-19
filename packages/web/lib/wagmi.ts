import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum],
  connectors: projectId
    ? [injected(), walletConnect({ projectId })]
    : [injected()],
  transports: {
    [mainnet.id]: http(
      alchemyKey
        ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
        : 'https://eth.llamarpc.com'
    ),
    [sepolia.id]: http(
      alchemyKey
        ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`
        : 'https://rpc.ankr.com/eth_sepolia'
    ),
    [polygon.id]: http('https://polygon-rpc.com'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
