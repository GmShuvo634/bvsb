// frontend_design/src/services/chatService.ts
import { Config } from '@/config';

export interface ChatMessage {
  id: string;
  message: string;
  avatar: string;
  username: string;
  timestamp: string;
  isDemo?: boolean;
  country?: string;
}

export interface ChatServiceConfig {
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class ChatService {
  private ws: WebSocket | null = null;
  private config: ChatServiceConfig = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor(config: ChatServiceConfig = {}) {
    this.config = config;
  }

  // Initialize WebSocket connection
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.isConnecting = true;

      try {
        // Use the same WebSocket endpoint as the existing game WebSocket
        const wsUrl = process.env.NODE_ENV === 'production'
          ? 'wss://your-domain.com/ws'
          : 'ws://localhost:5001/ws';

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[Chat] WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.config.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            // Decode base64 message (matching backend format)
            const decoded = JSON.parse(atob(event.data));
            const { message } = decoded;

            if (message.type === 'chatMessage') {
              this.config.onMessage?.(message.data);
            } else if (message.type === 'chatError') {
              this.config.onError?.(message.data.error);
            }
          } catch (error) {
            console.error('[Chat] Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('[Chat] WebSocket disconnected');
          this.isConnecting = false;
          this.config.onDisconnect?.();
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('[Chat] WebSocket error:', error);
          this.isConnecting = false;
          this.config.onError?.('Connection error');
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Handle automatic reconnection
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`[Chat] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    } else {
      console.error('[Chat] Max reconnection attempts reached');
      this.config.onError?.('Connection lost');
    }
  }

  // Send chat message via WebSocket
  sendMessage(message: string, userInfo: { address?: string; userId?: string; guestId?: string } = {}): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.config.onError?.('Not connected to chat server');
      return;
    }

    try {
      const payload = {
        type: 'chatMessage',
        data: {
          message,
          address: userInfo.address,
          userId: userInfo.userId,
          guestId: userInfo.guestId
        }
      };

      // Encode message in base64 (matching backend format)
      const encoded = btoa(JSON.stringify(payload));
      this.ws.send(encoded);
    } catch (error) {
      console.error('[Chat] Failed to send message:', error);
      this.config.onError?.('Failed to send message');
    }
  }

  // Get recent messages via REST API
  async getRecentMessages(limit = 50): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${Config.serverUrl.https}/api/chat/messages?limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('[Chat] Failed to fetch recent messages:', error);
      throw error;
    }
  }

  // Send message via REST API (fallback)
  async sendMessageRest(message: string): Promise<ChatMessage> {
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${Config.serverUrl.https}/api/chat/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('[Chat] Failed to send message via REST:', error);
      throw error;
    }
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  // Check connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Update configuration
  updateConfig(config: Partial<ChatServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Create singleton instance
export const chatService = new ChatService();

// Export class for creating multiple instances if needed
export default ChatService;
