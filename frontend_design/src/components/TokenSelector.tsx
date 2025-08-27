// src/components/TokenSelector.tsx
import React, { useState, useEffect } from 'react';
import { TokenConfig } from '../config/tokens';
import { web3Service } from '../services/web3Service';

interface TokenSelectorProps {
  selectedToken?: 'USDT' | 'USDC';
  onTokenChange?: (token: 'USDT' | 'USDC') => void;
  userAddress?: string;
  className?: string;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken = 'USDT',
  onTokenChange,
  userAddress,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const supportedTokens = web3Service.getSupportedTokens();

  useEffect(() => {
    if (userAddress && supportedTokens.length > 0) {
      loadBalances();
    }
  }, [userAddress, supportedTokens]);

  const loadBalances = async () => {
    if (!userAddress) return;
    
    setIsLoadingBalances(true);
    try {
      const newBalances: Record<string, string> = {};
      
      for (const token of supportedTokens) {
        try {
          const balance = await web3Service.getTokenBalance(
            token.symbol as 'USDT' | 'USDC', 
            userAddress
          );
          newBalances[token.symbol] = balance;
        } catch (error) {
          console.error(`Failed to load ${token.symbol} balance:`, error);
          newBalances[token.symbol] = '0';
        }
      }
      
      setBalances(newBalances);
    } catch (error) {
      console.error('Failed to load token balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const handleTokenSelect = (tokenSymbol: 'USDT' | 'USDC') => {
    onTokenChange?.(tokenSymbol);
    setIsOpen(false);
  };

  const getSelectedTokenConfig = (): TokenConfig | undefined => {
    return supportedTokens.find(token => token.symbol === selectedToken);
  };

  const selectedTokenConfig = getSelectedTokenConfig();

  if (supportedTokens.length === 0) {
    return (
      <div className={`px-4 py-2 bg-gray-800 rounded-lg ${className}`}>
        <span className="text-gray-400 text-sm">No tokens available</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected Token Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#181923] to-[#292a3a] border border-[#3f404f] hover:border-[#7074b9] rounded-lg transition-all duration-200 w-full"
      >
        {selectedTokenConfig ? (
          <>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-sm font-bold text-white">
              {selectedTokenConfig.symbol.charAt(0)}
            </div>
            
            <div className="flex-1 text-left">
              <div className="text-white font-medium">{selectedTokenConfig.symbol}</div>
              <div className="text-xs text-gray-400">{selectedTokenConfig.name}</div>
            </div>
            
            {userAddress && (
              <div className="text-right">
                <div className="text-sm text-white">
                  {isLoadingBalances ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  ) : (
                    parseFloat(balances[selectedTokenConfig.symbol] || '0').toFixed(4)
                  )}
                </div>
                <div className="text-xs text-gray-400">Balance</div>
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-400">Select Token</span>
        )}
        
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1b26] border border-[#3f404f] rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-[#3f404f]">
              Select Token
            </div>
            
            {supportedTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => handleTokenSelect(token.symbol as 'USDT' | 'USDC')}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a2b36] transition-colors ${
                  selectedToken === token.symbol ? 'bg-[#2a2b36] border-r-2 border-green-500' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-sm font-bold text-white">
                  {token.symbol.charAt(0)}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{token.symbol}</div>
                  <div className="text-xs text-gray-400">{token.name}</div>
                  <div className="text-xs text-gray-500">{token.decimals} decimals</div>
                </div>
                
                {userAddress && (
                  <div className="text-right">
                    <div className="text-sm text-white">
                      {isLoadingBalances ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                      ) : (
                        parseFloat(balances[token.symbol] || '0').toFixed(4)
                      )}
                    </div>
                    <div className="text-xs text-gray-400">Balance</div>
                  </div>
                )}
                
                {selectedToken === token.symbol && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
          
          <div className="px-4 py-2 text-xs text-gray-500 border-t border-[#3f404f] bg-[#16171f]">
            💡 Token balances update automatically
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
