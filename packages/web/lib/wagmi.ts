import { http, fallback, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Use explicit public RPC endpoints with CORS support instead of viem defaults
// (viem's default eth.merkle.io blocks browser cross-origin requests)
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum],
  connectors: projectId
    ? [injected(), walletConnect({ projectId })]
    : [injected()],
  transports: {
    [mainnet.id]: alchemyKey
      ? http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`)
      : fallback([
          http('https://eth.llamarpc.com'),
          http('https://cloudflare-eth.com'),
          http('https://rpc.ankr.com/eth'),
        ]),
    [sepolia.id]: alchemyKey
      ? http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`)
      : fallback([
          http('https://rpc.sepolia.org'),
          http('https://rpc.ankr.com/eth_sepolia'),
        ]),
    [polygon.id]: fallback([
      http('https://polygon-rpc.com'),
      http('https://rpc.ankr.com/polygon'),
    ]),
    [arbitrum.id]: fallback([
      http('https://arb1.arbitrum.io/rpc'),
      http('https://rpc.ankr.com/arbitrum'),
    ]),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
