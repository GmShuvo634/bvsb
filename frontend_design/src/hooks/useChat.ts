// frontend_design/src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { chatService, ChatMessage } from '@/services/chatService';

interface UseChatOptions {
  autoConnect?: boolean;
  maxMessages?: number;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearError: () => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshMessages: () => Promise<void>;
}

export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
  const { autoConnect = true, maxMessages = 100 } = options;
  const { address, isConnected: isWalletConnected } = useAccount();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesRef = useRef<ChatMessage[]>([]);
  const userIdRef = useRef<string | null>(null);
  const guestIdRef = useRef<string | null>(null);

  // Generate or retrieve guest ID for non-authenticated users
  useEffect(() => {
    if (!isWalletConnected && !guestIdRef.current) {
      const existingGuestId = localStorage.getItem('chatGuestId');
      if (existingGuestId) {
        guestIdRef.current = existingGuestId;
      } else {
        const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        guestIdRef.current = newGuestId;
        localStorage.setItem('chatGuestId', newGuestId);
      }
    }
  }, [isWalletConnected]);

  // Handle new messages
  const handleNewMessage = useCallback((message: ChatMessage) => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, message];
      // Keep only the most recent messages
      if (newMessages.length > maxMessages) {
        return newMessages.slice(-maxMessages);
      }
      return newMessages;
    });
  }, [maxMessages]);

  // Handle connection status
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setError(null);
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  // Handle errors
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    console.error('[useChat] Error:', errorMessage);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Connect to chat service
  const connect = useCallback(async () => {
    if (isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      // Update chat service configuration
      chatService.updateConfig({
        onMessage: handleNewMessage,
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        onError: handleError
      });

      // Connect to WebSocket
      await chatService.connect();

      // Load recent messages
      await refreshMessages();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to chat';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, handleNewMessage, handleConnect, handleDisconnect, handleError]);

  // Disconnect from chat service
  const disconnect = useCallback(() => {
    chatService.disconnect();
    setIsConnected(false);
  }, []);

  // Refresh messages from server
  const refreshMessages = useCallback(async () => {
    try {
      const recentMessages = await chatService.getRecentMessages(maxMessages);
      setMessages(recentMessages);
      messagesRef.current = recentMessages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
    }
  }, [maxMessages]);

  // Send a message
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (message.length > 500) {
      setError('Message too long (max 500 characters)');
      return;
    }

    try {
      setError(null);

      const userInfo = {
        address: address,
        userId: userIdRef.current || undefined,
        guestId: guestIdRef.current || undefined
      };

      if (chatService.isConnected()) {
        // Send via WebSocket
        chatService.sendMessage(message, userInfo);
      } else {
        // Fallback to REST API
        const sentMessage = await chatService.sendMessageRest(message);
        handleNewMessage(sentMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    }
  }, [address, handleNewMessage]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  // Update messages ref when messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    clearError,
    connect,
    disconnect,
    refreshMessages
  };
};
