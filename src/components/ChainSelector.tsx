// src/components/ChainSelector.tsx
import React, { useState, useEffect } from 'react';
import { SUPPORTED_CHAINS, ChainConfig } from '../config/tokens';
import { web3Service } from '../services/web3Service';

interface ChainSelectorProps {
  onChainChange?: (chainId: number) => void;
  className?: string;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ 
  onChainChange, 
  className = "" 
}) => {
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateChainId = () => {
      const chainId = web3Service.getCurrentChainId();
      setCurrentChainId(chainId);
    };

    updateChainId();
    
    // Listen for chain changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', updateChainId);
      return () => window.ethereum.removeListener('chainChanged', updateChainId);
    }
  }, []);

  const handleChainSwitch = async (chainId: number) => {
    if (chainId === currentChainId) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await web3Service.switchChain(chainId);
      setCurrentChainId(chainId);
      onChainChange?.(chainId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch chain:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentChain = (): ChainConfig | null => {
    if (!currentChainId) return null;
    return Object.values(SUPPORTED_CHAINS).find(chain => chain.chainId === currentChainId) || null;
  };

  const currentChain = getCurrentChain();

  return (
    <div className={`relative ${className}`}>
      {/* Current Chain Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#181923] to-[#292a3a] border border-[#3f404f] hover:border-[#7074b9] rounded-lg transition-all duration-200 min-w-[180px]"
      >
        {currentChain ? (
          <>
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {currentChain.symbol}
            </div>
            <span className="text-white font-medium">{currentChain.name}</span>
          </>
        ) : (
          <span className="text-gray-400">Select Network</span>
        )}
        
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin ml-auto" />
        ) : (
          <svg 
            className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1b26] border border-[#3f404f] rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-[#3f404f]">
              Select Network
            </div>
            
            {Object.values(SUPPORTED_CHAINS).map((chain) => (
              <button
                key={chain.chainId}
                onClick={() => handleChainSwitch(chain.chainId)}
                disabled={isLoading}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a2b36] transition-colors ${
                  currentChainId === chain.chainId ? 'bg-[#2a2b36] border-r-2 border-blue-500' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  chain.chainId === 1 || chain.chainId === 11155111 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                }`}>
                  {chain.symbol}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{chain.name}</div>
                  <div className="text-xs text-gray-400">
                    Supports: {Object.keys(chain.tokens).join(', ')}
                  </div>
                </div>
                
                {currentChainId === chain.chainId && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
          
          <div className="px-4 py-2 text-xs text-gray-500 border-t border-[#3f404f] bg-[#16171f]">
            💡 Switch networks to access different tokens
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainSelector;
