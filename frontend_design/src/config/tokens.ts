// src/config/tokens.ts

export interface TokenConfig {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon?: string;
}

export interface ChainConfig {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  tokens: {
    USDT: TokenConfig;
    USDC: TokenConfig;
  };
  priceFeed: string; // Chainlink ETH/USD price feed address
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    chainId: 1,
    name: "Ethereum Mainnet",
    symbol: "ETH",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorerUrl: "https://etherscan.io",
    priceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    tokens: {
      USDT: {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6
      },
      USDC: {
        address: "0xA0b86a33E6441b8C4505B8C4505B8C4505B8C4505",
        symbol: "USDC", 
        name: "USD Coin",
        decimals: 6
      }
    }
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    symbol: "ETH",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    tokens: {
      USDT: {
        address: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
        symbol: "USDT",
        name: "Test Tether USD",
        decimals: 6
      },
      USDC: {
        address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
        symbol: "USDC",
        name: "Test USD Coin", 
        decimals: 6
      }
    }
  },
  bsc: {
    chainId: 56,
    name: "BNB Smart Chain",
    symbol: "BNB",
    rpcUrl: "https://bsc-dataseed1.binance.org/",
    blockExplorerUrl: "https://bscscan.com",
    priceFeed: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
    tokens: {
      USDT: {
        address: "0x55d398326f99059fF775485246999027B3197955",
        symbol: "USDT",
        name: "Tether USD (BSC)",
        decimals: 18
      },
      USDC: {
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        symbol: "USDC",
        name: "USD Coin (BSC)",
        decimals: 18
      }
    }
  },
  bscTestnet: {
    chainId: 97,
    name: "BNB Smart Chain Testnet",
    symbol: "BNB",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    blockExplorerUrl: "https://testnet.bscscan.com",
    priceFeed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
    tokens: {
      USDT: {
        address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
        symbol: "USDT",
        name: "Test Tether USD (BSC)",
        decimals: 18
      },
      USDC: {
        address: "0x64544969ed7EBf5f083679233325356EbE738930",
        symbol: "USDC", 
        name: "Test USD Coin (BSC)",
        decimals: 18
      }
    }
  }
};

export const DEFAULT_CHAIN = "sepolia";

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.chainId === chainId);
}

export function getTokenConfig(chainId: number, tokenSymbol: 'USDT' | 'USDC'): TokenConfig | undefined {
  const chain = getChainConfig(chainId);
  return chain?.tokens[tokenSymbol];
}

export function formatTokenAmount(amount: string | number, decimals: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (num / Math.pow(10, decimals)).toFixed(6);
}

export function parseTokenAmount(amount: string | number, decimals: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (num * Math.pow(10, decimals)).toString();
}
