// src/config/wagmi.ts
import { createConfig, configureChains } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

// 1. Get projectId from environment
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo-project-id'

// 2. Define chains manually for wagmi v1.4.13 compatibility
const chains = [
  {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.sepolia.org'] },
      public: { http: ['https://rpc.sepolia.org'] },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
    testnet: true,
  },
  {
    id: 1,
    name: 'Ethereum',
    network: 'homestead',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://eth.llamarpc.com'] },
      public: { http: ['https://eth.llamarpc.com'] },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://etherscan.io' },
    },
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    network: 'bsc',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://bsc-dataseed1.binance.org'] },
      public: { http: ['https://bsc-dataseed1.binance.org'] },
    },
    blockExplorers: {
      default: { name: 'BscScan', url: 'https://bscscan.com' },
    },
  },
]

// 3. Configure chains with providers for wagmi v1.4.13
const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  [
    jsonRpcProvider({
      rpc: (chain) => {
        switch (chain.id) {
          case 11155111: // Sepolia
            return { http: 'https://rpc.sepolia.org' }
          case 1: // Ethereum mainnet
            return { http: 'https://eth.llamarpc.com' }
          case 56: // BSC mainnet
            return { http: 'https://bsc-dataseed1.binance.org' }
          default:
            return null
        }
      },
    }),
    publicProvider(), // Fallback provider
  ]
)

// 4. Create wagmi config with proper provider configuration
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        shimDisconnect: true,
        UNSTABLE_shimOnConnectSelectAccount: true,
      }
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'Bears vs Bulls',
        appLogoUrl: 'https://bearsvsbulls.com/icon.png',
        darkMode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected Wallet',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

// 5. Wallet connection utilities (without Web3Modal)
export const connectMetaMask = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return true;
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      return false;
    }
  }
  return false;
}

// 6. Export chains and utilities
export { chains, publicClient, webSocketPublicClient }

// 7. Utility functions for wallet management
export const getWalletInfo = () => {
  return {
    supportedChains: chains.map(chain => ({
      id: chain.id,
      name: chain.name,
      symbol: chain.nativeCurrency.symbol,
      blockExplorer: chain.blockExplorers?.default?.url,
    })),
    defaultChain: chains[0], // Sepolia
    projectId,
  }
}

export const isChainSupported = (chainId: number): boolean => {
  return chains.some(chain => chain.id === chainId)
}

export const getSupportedChainIds = (): number[] => {
  return chains.map(chain => chain.id)
}

// 8. Initialize Wagmi (call this in your app)
export const initializeWagmi = () => {
  if (typeof window !== 'undefined') {
    console.log('🔗 Wagmi initialized with project ID:', projectId)
    console.log('🌐 Supported chains:', chains.map(c => c.name).join(', '))
    console.log('📡 Public client configured:', !!publicClient)
    console.log('🔌 WebSocket client configured:', !!webSocketPublicClient)
  }
}
