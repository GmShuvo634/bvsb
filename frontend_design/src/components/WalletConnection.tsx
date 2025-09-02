// src/components/WalletConnection.tsx
import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { soundService } from '../services/soundService';
import { web3Service } from '../services/web3Service';
import { SUPPORTED_CHAINS } from '../config/tokens';
import { toast } from 'sonner';

interface WalletConnectionProps {
  onConnectionChange?: (isConnected: boolean, address?: string) => void;
  showNetworkInfo?: boolean;
  className?: string;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnectionChange,
  showNetworkInfo = true,
  className = ""
}) => {
  const { address, isConnected, connector } = useAccount();
  const { chain } = useNetwork();
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();

  const [isConnecting, setIsConnecting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);

  useEffect(() => {
    onConnectionChange?.(isConnected, address);
  }, [isConnected, address, onConnectionChange]);

  const handleConnect = async (connector: any) => {
    setIsConnecting(true);
    try {
      soundService.playButtonClick();
      await connect({ connector });
      setShowConnectors(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      soundService.playButtonClick();
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleSwitchNetwork = async (chainId: number) => {
    try {
      soundService.playButtonClick();
      await switchNetwork?.(chainId);
      toast.success('Network switched successfully');
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network');
    }
  };

  const getChainInfo = () => {
    if (!chain) return null;
    return Object.values(SUPPORTED_CHAINS).find(c => c.chainId === chain.id);
  };

  const isUnsupportedChain = () => {
    if (!chain) return false;
    return !Object.values(SUPPORTED_CHAINS).some(c => c.chainId === chain.id);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className={`${className} relative`}>
        <button
          onClick={() => setShowConnectors(!showConnectors)}
          disabled={isConnecting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
        >
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connect Wallet
            </>
          )}
        </button>

        {/* Wallet Connectors Dropdown */}
        {showConnectors && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1b26] border border-[#3f404f] rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={!connector.ready || isLoading}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#2a2b36] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">{connector.name}</div>
                    <div className="text-xs text-gray-400">
                      {!connector.ready && ' (unsupported)'}
                      {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="relative">
        {/* Main wallet info button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#181923] to-[#292a3a] border border-[#3f404f] hover:border-[#7074b9] rounded-lg transition-all duration-200 min-w-[200px]"
        >
          {/* Wallet icon */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>

          <div className="flex-1 text-left">
            <div className="text-white font-medium">
              {connector?.name || 'Connected'}
            </div>
            <div className="text-xs text-gray-400">
              {address && formatAddress(address)}
            </div>
          </div>

          {/* Network indicator */}
          {showNetworkInfo && chain && (
            <div className={`w-3 h-3 rounded-full ${
              isUnsupportedChain() ? 'bg-red-500' : 'bg-green-500'
            }`} />
          )}

          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown details */}
        {showDetails && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1b26] border border-[#3f404f] rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-4 space-y-4">
              {/* Wallet info */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Wallet Details
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Wallet:</span>
                    <span className="text-white">{connector?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Address:</span>
                    <span className="text-white font-mono text-xs">{address && formatAddress(address)}</span>
                  </div>
                </div>
              </div>

              {/* Network info */}
              {showNetworkInfo && chain && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Network
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current:</span>
                      <span className={`text-white ${isUnsupportedChain() ? 'text-red-400' : ''}`}>
                        {chain.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Chain ID:</span>
                      <span className="text-white">{chain.id}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Unsupported network warning */}
              {isUnsupportedChain() && (
                <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-400 text-sm font-medium">Unsupported Network</span>
                  </div>
                  <p className="text-red-300 text-xs mb-3">
                    Please switch to a supported network to use the application.
                  </p>
                  <div className="space-y-1">
                    {Object.values(SUPPORTED_CHAINS).map((supportedChain) => (
                      <button
                        key={supportedChain.chainId}
                        onClick={() => handleSwitchNetwork(supportedChain.chainId)}
                        className="w-full text-left px-2 py-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded"
                      >
                        Switch to {supportedChain.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => open()}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Change Wallet
                </button>
                <button
                  onClick={handleDisconnect}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnection;
