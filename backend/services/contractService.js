// backend/services/contractService.js
const { ethers } = require('ethers');

// Multi-chain configuration
const CHAIN_CONFIGS = {
  1: { // Ethereum Mainnet
    name: 'Ethereum',
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    priceFeed: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    contractAddress: process.env.ETHEREUM_CONTRACT_ADDRESS
  },
  11155111: { // Sepolia Testnet
    name: 'Sepolia',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    priceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
    contractAddress: process.env.SEPOLIA_CONTRACT_ADDRESS
  },
  56: { // BSC Mainnet
    name: 'BSC',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    priceFeed: '0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e',
    contractAddress: process.env.BSC_CONTRACT_ADDRESS
  },
  97: { // BSC Testnet
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    priceFeed: '0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7',
    contractAddress: process.env.BSC_TESTNET_CONTRACT_ADDRESS
  }
};

// Chainlink Price Feed ABI
const PRICE_FEED_ABI = [
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];

class ContractService {
  constructor() {
    this.providers = {};
    this.initializeProviders();
  }

  initializeProviders() {
    for (const [chainId, config] of Object.entries(CHAIN_CONFIGS)) {
      try {
        this.providers[chainId] = new ethers.providers.JsonRpcProvider(config.rpcUrl);
      } catch (error) {
        console.error(`Failed to initialize provider for chain ${chainId}:`, error);
      }
    }
  }

  /**
   * Get current ETH/USD price from Chainlink price feed
   * @param {number} chainId - Chain ID to get price from
   * @returns {Promise<number>} Price in USD
   */
  async getCurrentPrice(chainId = 11155111) {
    try {
      const config = CHAIN_CONFIGS[chainId];
      if (!config) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      const provider = this.providers[chainId];
      if (!provider) {
        throw new Error(`Provider not available for chain ${chainId}`);
      }

      const priceFeedContract = new ethers.Contract(
        config.priceFeed,
        PRICE_FEED_ABI,
        provider
      );

      const [, price] = await priceFeedContract.latestRoundData();

      // Chainlink returns price with 8 decimals
      return parseFloat(ethers.utils.formatUnits(price, 8));
    } catch (err) {
      console.error(`💥 contractService.getCurrentPrice error for chain ${chainId}:`, err);

      // Fallback to CoinGecko if Chainlink fails
      try {
        const axios = require('axios');
        const res = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price',
          { params: { ids: 'ethereum', vs_currencies: 'usd' } }
        );
        console.log('📈 Using CoinGecko fallback price');
        return res.data.ethereum.usd;
      } catch (fallbackErr) {
        console.error('💥 CoinGecko fallback also failed:', fallbackErr);
        throw err;
      }
    }
  }

  /**
   * Get provider for specific chain
   * @param {number} chainId
   * @returns {ethers.providers.JsonRpcProvider}
   */
  getProvider(chainId) {
    return this.providers[chainId];
  }

  /**
   * Get chain configuration
   * @param {number} chainId
   * @returns {object}
   */
  getChainConfig(chainId) {
    return CHAIN_CONFIGS[chainId];
  }

  /**
   * Get all supported chains
   * @returns {object}
   */
  getSupportedChains() {
    return CHAIN_CONFIGS;
  }
}

module.exports = new ContractService();