// src/components/DepositPanel.tsx
import React, { useState, useEffect } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { depositService, TokenBalance, DepositResult } from '../services/depositService';
import { web3Service } from '../services/web3Service';
import { soundService } from '../services/soundService';
import TokenSelector from './TokenSelector';
import ChainSelector from './ChainSelector';
import { toast } from 'sonner';

interface DepositPanelProps {
  onDepositSuccess?: (result: DepositResult) => void;
  className?: string;
}

const DepositPanel: React.FC<DepositPanelProps> = ({
  onDepositSuccess,
  className = ""
}) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const [selectedToken, setSelectedToken] = useState<'USDT' | 'USDC'>('USDT');
  const [depositAmount, setDepositAmount] = useState('');
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [allowance, setAllowance] = useState('0');
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      loadTokenBalances();
      loadContractInfo();
    }
  }, [isConnected, address, chain]);

  useEffect(() => {
    if (isConnected && address && contractAddress) {
      checkAllowance();
    }
  }, [selectedToken, isConnected, address, contractAddress]);

  const loadTokenBalances = async () => {
    if (!address) return;

    try {
      const balances = await depositService.getTokenBalances(address);
      setTokenBalances(balances);
    } catch (error) {
      console.error('Failed to load token balances:', error);
      toast.error('Failed to load token balances');
    }
  };

  const loadContractInfo = () => {
    const addr = depositService.getContractAddress();
    setContractAddress(addr);
  };

  const checkAllowance = async () => {
    if (!address || !contractAddress) return;

    try {
      const allowanceAmount = await depositService.checkTokenAllowance(
        selectedToken,
        address,
        contractAddress
      );
      setAllowance(allowanceAmount);
    } catch (error) {
      console.error('Failed to check allowance:', error);
      setAllowance('0');
    }
  };

  const handleApprove = async () => {
    if (!address || !contractAddress || !depositAmount) return;

    setIsApproving(true);
    try {
      const tx = await depositService.approveToken(
        selectedToken,
        contractAddress,
        depositAmount
      );

      toast.info('Approval transaction submitted...');
      await tx.wait();

      toast.success('Token approval successful!');
      await checkAllowance();

    } catch (error: any) {
      console.error('Approval failed:', error);
      toast.error(`Approval failed: ${error.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeposit = async () => {
    if (!address || !depositAmount) return;

    setIsLoading(true);
    try {
      let result: DepositResult;

      if (contractAddress) {
        // Real contract deposit (for production)
        result = await depositService.depositToContract(
          selectedToken,
          depositAmount,
          address
        );
      } else {
        // Simulated deposit (for testing)
        result = await depositService.simulateDeposit(selectedToken, depositAmount);
      }

      if (result.success) {
        toast.success(`Successfully deposited ${depositAmount} ${selectedToken}!`);
        setDepositAmount('');
        await loadTokenBalances();
        onDepositSuccess?.(result);
      } else {
        toast.error(`Deposit failed: ${result.error}`);
      }

    } catch (error: any) {
      console.error('Deposit failed:', error);
      toast.error(`Deposit failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedTokenBalance = (): TokenBalance | undefined => {
    return tokenBalances.find(balance => balance.symbol === selectedToken);
  };

  const isApprovalNeeded = (): boolean => {
    if (!depositAmount || !allowance) return false;
    return parseFloat(allowance) < parseFloat(depositAmount);
  };

  const canDeposit = (): boolean => {
    if (!depositAmount || !isConnected) return false;
    const balance = getSelectedTokenBalance();
    if (!balance) return false;

    const hasEnoughBalance = parseFloat(balance.balance) >= parseFloat(depositAmount);
    const hasEnoughAllowance = !isApprovalNeeded();

    return hasEnoughBalance && hasEnoughAllowance;
  };

  if (!isConnected) {
    return (
      <div className={`p-6 bg-gradient-to-r from-[#181923] to-[#292a3a] border border-[#3f404f] rounded-lg ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
          <p className="text-gray-400 text-sm">Connect your wallet to deposit tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-r from-[#181923] to-[#292a3a] border border-[#3f404f] rounded-lg ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Deposit Tokens</h3>
          <p className="text-gray-400 text-sm">
            {chain?.name || 'Unknown Network'} • {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Chain Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Network
          </label>
          <ChainSelector className="w-full" />
        </div>

        {/* Token Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Token
          </label>
          <TokenSelector
            selectedToken={selectedToken}
            onTokenChange={setSelectedToken}
            userAddress={address}
            className="w-full"
          />
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.000001"
              className="w-full px-4 py-3 bg-[#1a1b26] border border-[#3f404f] rounded-lg text-white placeholder-gray-500 focus:border-[#7074b9] focus:outline-none"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-gray-400 text-sm">{selectedToken}</span>
            </div>
          </div>

          {/* Balance Display */}
          {getSelectedTokenBalance() && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Available:</span>
              <span className="text-white">
                {getSelectedTokenBalance()?.formattedBalance} {selectedToken}
              </span>
            </div>
          )}
        </div>

        {/* Contract Info */}
        {contractAddress && (
          <div className="p-3 bg-[#1a1b26] border border-[#3f404f] rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Contract Address:</div>
            <div className="text-xs text-white font-mono break-all">{contractAddress}</div>
          </div>
        )}

        {/* Approval Section */}
        {isApprovalNeeded() && (
          <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-400 text-sm font-medium">Approval Required</span>
            </div>
            <p className="text-yellow-300 text-xs mb-3">
              You need to approve the contract to spend your {selectedToken} tokens.
            </p>
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {isApproving ? 'Approving...' : `Approve ${selectedToken}`}
            </button>
          </div>
        )}

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={!canDeposit() || isLoading}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-bold text-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Depositing...
            </div>
          ) : (
            `Deposit ${depositAmount || '0'} ${selectedToken}`
          )}
        </button>

        {/* Testing Note */}
        <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <div className="text-blue-400 text-xs">
            <strong>Testing Mode:</strong> This deposit function is configured for Sepolia testnet testing.
            {!contractAddress && ' Currently using simulated deposits.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositPanel;
