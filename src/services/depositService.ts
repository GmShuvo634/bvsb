// src/services/depositService.ts
import { ethers } from 'ethers';
import { web3Service } from './web3Service';
import { getChainConfig, getTokenConfig } from '../config/tokens';
import { soundService } from './soundService';

// Contract ABI for our betting contract
const BETTING_CONTRACT_ABI = [
  "function addSupportedToken(address _token, string memory _symbol) external",
  "function placeTrade(address token, uint256 amount, uint8 direction, uint256 expiry) external",
  "function supportedTokens(address) view returns (bool)",
  "function tokenSymbols(address) view returns (string)"
];

// ERC20 ABI for token operations
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

export interface DepositResult {
  success: boolean;
  txHash?: string;
  error?: string;
  newBalance?: string;
}

export interface TokenBalance {
  symbol: 'USDT' | 'USDC';
  balance: string;
  formattedBalance: string;
  decimals: number;
}

class DepositService {
  private contractAddress: string | null = null;

  constructor() {
    this.initializeContractAddress();
  }

  private initializeContractAddress() {
    // Get contract address for current chain
    const chainId = web3Service.getCurrentChainId();
    if (chainId) {
      const chainConfig = getChainConfig(chainId);
      // For now, we'll use a placeholder - this should be set from environment
      this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || null;
    }
  }

  /**
   * Get token balances for the connected wallet
   */
  async getTokenBalances(userAddress: string): Promise<TokenBalance[]> {
    const chainId = web3Service.getCurrentChainId();
    if (!chainId) {
      throw new Error('No chain connected');
    }

    const supportedTokens = web3Service.getSupportedTokens();
    const balances: TokenBalance[] = [];

    for (const token of supportedTokens) {
      try {
        const balance = await web3Service.getTokenBalance(
          token.symbol as 'USDT' | 'USDC',
          userAddress
        );
        
        balances.push({
          symbol: token.symbol as 'USDT' | 'USDC',
          balance,
          formattedBalance: parseFloat(balance).toFixed(4),
          decimals: token.decimals
        });
      } catch (error) {
        console.warn(`Failed to get ${token.symbol} balance:`, error);
        balances.push({
          symbol: token.symbol as 'USDT' | 'USDC',
          balance: '0',
          formattedBalance: '0.0000',
          decimals: token.decimals
        });
      }
    }

    return balances;
  }

  /**
   * Check if token is approved for spending
   */
  async checkTokenAllowance(
    tokenSymbol: 'USDT' | 'USDC',
    userAddress: string,
    spenderAddress: string
  ): Promise<string> {
    return await web3Service.getTokenAllowance(tokenSymbol, userAddress, spenderAddress);
  }

  /**
   * Approve token for spending
   */
  async approveToken(
    tokenSymbol: 'USDT' | 'USDC',
    spenderAddress: string,
    amount: string
  ): Promise<ethers.ContractTransaction> {
    soundService.playButtonClick();
    return await web3Service.approveToken(tokenSymbol, spenderAddress, amount);
  }

  /**
   * Deposit tokens to the betting contract (for testing on Sepolia)
   */
  async depositToContract(
    tokenSymbol: 'USDT' | 'USDC',
    amount: string,
    userAddress: string
  ): Promise<DepositResult> {
    try {
      if (!this.contractAddress) {
        throw new Error('Contract address not configured');
      }

      const chainId = web3Service.getCurrentChainId();
      if (!chainId) {
        throw new Error('No chain connected');
      }

      const tokenConfig = getTokenConfig(chainId, tokenSymbol);
      if (!tokenConfig) {
        throw new Error(`Token ${tokenSymbol} not supported on current chain`);
      }

      // Check if user has enough balance
      const balance = await web3Service.getTokenBalance(tokenSymbol, userAddress);
      if (parseFloat(balance) < parseFloat(amount)) {
        throw new Error('Insufficient token balance');
      }

      // Check allowance
      const allowance = await this.checkTokenAllowance(
        tokenSymbol,
        userAddress,
        this.contractAddress
      );

      // If allowance is insufficient, request approval
      if (parseFloat(allowance) < parseFloat(amount)) {
        console.log('Requesting token approval...');
        const approveTx = await this.approveToken(
          tokenSymbol,
          this.contractAddress,
          amount
        );
        
        // Wait for approval transaction
        await approveTx.wait();
        console.log('Token approved successfully');
      }

      // For testing purposes, we'll simulate a successful deposit
      // In a real implementation, this would interact with the contract
      soundService.playNotification();
      
      const newBalance = await web3Service.getTokenBalance(tokenSymbol, userAddress);
      
      return {
        success: true,
        txHash: 'simulated-tx-hash',
        newBalance
      };

    } catch (error: any) {
      console.error('Deposit failed:', error);
      return {
        success: false,
        error: error.message || 'Deposit failed'
      };
    }
  }

  /**
   * Simulate deposit for testing (updates backend balance)
   */
  async simulateDeposit(
    tokenSymbol: 'USDT' | 'USDC',
    amount: string
  ): Promise<DepositResult> {
    try {
      // This simulates a successful deposit by calling the backend API
      const response = await fetch('/api/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: parseFloat(amount),
          token: tokenSymbol 
        }),
      });

      if (!response.ok) {
        throw new Error('Backend deposit failed');
      }

      const data = await response.json();
      soundService.playWinSound();

      return {
        success: true,
        newBalance: data.balance?.toString() || amount
      };

    } catch (error: any) {
      console.error('Simulated deposit failed:', error);
      return {
        success: false,
        error: error.message || 'Simulated deposit failed'
      };
    }
  }

  /**
   * Get contract address for current chain
   */
  getContractAddress(): string | null {
    return this.contractAddress;
  }

  /**
   * Set contract address (useful for testing)
   */
  setContractAddress(address: string) {
    this.contractAddress = address;
  }

  /**
   * Check if token is supported by the contract
   */
  async isTokenSupported(tokenSymbol: 'USDT' | 'USDC'): Promise<boolean> {
    try {
      if (!this.contractAddress) return false;

      const chainId = web3Service.getCurrentChainId();
      if (!chainId) return false;

      const tokenConfig = getTokenConfig(chainId, tokenSymbol);
      if (!tokenConfig) return false;

      // For testing, we'll assume all configured tokens are supported
      return true;

    } catch (error) {
      console.error('Error checking token support:', error);
      return false;
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: string, decimals: number): string {
    const num = parseFloat(amount);
    return num.toFixed(Math.min(decimals, 6));
  }

  /**
   * Parse amount for contract interaction
   */
  parseAmount(amount: string, decimals: number): string {
    return ethers.utils.parseUnits(amount, decimals).toString();
  }
}

// Singleton instance
export const depositService = new DepositService();

// React hook for deposit service
export function useDepositService() {
  return depositService;
}
