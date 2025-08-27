// src/services/web3Service.ts
import { ethers } from 'ethers';
import { SUPPORTED_CHAINS, getChainConfig, getTokenConfig, TokenConfig } from '../config/tokens';

// Standard ERC20 ABI for token interactions
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

// Chainlink Price Feed ABI
const PRICE_FEED_ABI = [
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private currentChainId: number | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      // Get current chain ID
      const network = await this.provider.getNetwork();
      this.currentChainId = network.chainId;

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        this.currentChainId = parseInt(chainId, 16);
        window.location.reload(); // Reload to update UI
      });
    }
  }

  async connectWallet(): Promise<string | null> {
    if (!this.provider) {
      throw new Error('No Web3 provider found');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = await this.signer?.getAddress();
      return address || null;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async switchChain(chainId: number): Promise<boolean> {
    if (!window.ethereum) {
      throw new Error('No Web3 provider found');
    }

    const chainConfig = getChainConfig(chainId);
    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      this.currentChainId = chainId;
      return true;
    } catch (error: any) {
      // Chain not added to wallet
      if (error.code === 4902) {
        return await this.addChain(chainConfig);
      }
      throw error;
    }
  }

  private async addChain(chainConfig: any): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chainConfig.chainId.toString(16)}`,
          chainName: chainConfig.name,
          nativeCurrency: {
            name: chainConfig.symbol,
            symbol: chainConfig.symbol,
            decimals: 18,
          },
          rpcUrls: [chainConfig.rpcUrl],
          blockExplorerUrls: [chainConfig.blockExplorerUrl],
        }],
      });
      
      this.currentChainId = chainConfig.chainId;
      return true;
    } catch (error) {
      console.error('Failed to add chain:', error);
      return false;
    }
  }

  async getTokenBalance(tokenSymbol: 'USDT' | 'USDC', userAddress: string): Promise<string> {
    if (!this.provider || !this.currentChainId) {
      throw new Error('Provider not initialized');
    }

    const tokenConfig = getTokenConfig(this.currentChainId, tokenSymbol);
    if (!tokenConfig) {
      throw new Error(`Token ${tokenSymbol} not supported on current chain`);
    }

    const tokenContract = new ethers.Contract(tokenConfig.address, ERC20_ABI, this.provider);
    const balance = await tokenContract.balanceOf(userAddress);
    
    return ethers.utils.formatUnits(balance, tokenConfig.decimals);
  }

  async approveToken(tokenSymbol: 'USDT' | 'USDC', spenderAddress: string, amount: string): Promise<ethers.ContractTransaction> {
    if (!this.signer || !this.currentChainId) {
      throw new Error('Signer not initialized');
    }

    const tokenConfig = getTokenConfig(this.currentChainId, tokenSymbol);
    if (!tokenConfig) {
      throw new Error(`Token ${tokenSymbol} not supported on current chain`);
    }

    const tokenContract = new ethers.Contract(tokenConfig.address, ERC20_ABI, this.signer);
    const parsedAmount = ethers.utils.parseUnits(amount, tokenConfig.decimals);
    
    return await tokenContract.approve(spenderAddress, parsedAmount);
  }

  async getTokenAllowance(tokenSymbol: 'USDT' | 'USDC', ownerAddress: string, spenderAddress: string): Promise<string> {
    if (!this.provider || !this.currentChainId) {
      throw new Error('Provider not initialized');
    }

    const tokenConfig = getTokenConfig(this.currentChainId, tokenSymbol);
    if (!tokenConfig) {
      throw new Error(`Token ${tokenSymbol} not supported on current chain`);
    }

    const tokenContract = new ethers.Contract(tokenConfig.address, ERC20_ABI, this.provider);
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
    
    return ethers.utils.formatUnits(allowance, tokenConfig.decimals);
  }

  async getETHPrice(): Promise<number> {
    if (!this.provider || !this.currentChainId) {
      throw new Error('Provider not initialized');
    }

    const chainConfig = getChainConfig(this.currentChainId);
    if (!chainConfig?.priceFeed) {
      throw new Error('Price feed not available for current chain');
    }

    const priceFeedContract = new ethers.Contract(chainConfig.priceFeed, PRICE_FEED_ABI, this.provider);
    const [, price] = await priceFeedContract.latestRoundData();
    
    // Chainlink price feeds return price with 8 decimals
    return parseFloat(ethers.utils.formatUnits(price, 8));
  }

  getCurrentChainId(): number | null {
    return this.currentChainId;
  }

  getCurrentChainConfig() {
    return this.currentChainId ? getChainConfig(this.currentChainId) : null;
  }

  getSupportedTokens() {
    const chainConfig = this.getCurrentChainConfig();
    return chainConfig ? Object.values(chainConfig.tokens) : [];
  }
}

// Singleton instance
export const web3Service = new Web3Service();
