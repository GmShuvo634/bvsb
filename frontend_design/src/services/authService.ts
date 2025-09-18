// src/services/authService.ts
import { soundService } from './soundService';

export interface User {
  id: string;
  email: string;
  balance: number;
  avatar?: string;
  country?: string;
  isDemo?: boolean;
}

export interface AuthData {
  user: User;
  token: string;
  isAuthenticated: boolean;
  isDemo?: boolean;
}

class AuthService {
  private authData: AuthData | null = null;
  private listeners: ((authData: AuthData | null) => void)[] = [];

  constructor() {
    this.loadStoredAuth();
  }

  /**
   * Load authentication data from storage
   */
  private loadStoredAuth() {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      // Always use localStorage for token storage
      const stored = localStorage.getItem('auth');

      if (stored) {
        const authData = JSON.parse(stored);
        this.authData = authData;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      // Only clear auth on client side
      if (typeof window !== 'undefined') {
        this.clearAuth();
      }
    }
  }

  /**
   * Set authentication data
   */
  setAuth(authData: AuthData) {
    this.authData = authData;

    // Only run on client side
    if (typeof window !== 'undefined') {
      // Always store in localStorage
      localStorage.setItem('auth', JSON.stringify(authData));

      // Clear sessionStorage to ensure no old data remains
      sessionStorage.removeItem('auth');
    }

    this.notifyListeners();
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.authData = null;

    // Only run on client side
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth');
      sessionStorage.removeItem('auth');
    }

    this.notifyListeners();
  }

  /**
   * Force clear all cached data and require fresh login
   */
  forceClearCache() {
    this.clearAuth();
    console.log('Authentication cache cleared - fresh login required');
  }

  /**
   * Get current authentication data
   */
  getAuth(): AuthData | null {
    return this.authData;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authData?.isAuthenticated || false;
  }



  /**
   * Get current user
   */
  getUser(): User | null {
    return this.authData?.user || null;
  }

  /**
   * Check if user is in demo mode
   */
  isDemoMode(): boolean {
    return this.authData?.isDemo || false;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.authData?.token || null;
  }

  /**
   * Update user data
   */
  updateUser(userData: Partial<User>) {
    if (this.authData) {
      this.authData.user = { ...this.authData.user, ...userData };

      // Always update localStorage
      localStorage.setItem('auth', JSON.stringify(this.authData));

      this.notifyListeners();
    }
  }

  /**
   * Update user balance
   */
  updateBalance(newBalance: number) {
    this.updateUser({ balance: newBalance });
  }

  /**
   * Refresh user data from server
   */
  async refreshUserData(): Promise<void> {
    try {
      if (!this.authData?.token) {
        throw new Error('No authentication token available');
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiBaseUrl}/api/user/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authData.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh user data');
      }

      const userData = await response.json();

      // Update user data with fresh data from server
      this.updateUser({
        balance: userData.balance,
        avatar: userData.avatar || '',
        country: userData.country || '',
      });

      console.log('User data refreshed:', userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }

  /**
   * Add listener for auth changes
   */
  addListener(listener: (authData: AuthData | null) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.authData);
  }

  /**
   * Remove listener
   */
  removeListener(listener: (authData: AuthData | null) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Subscribe to auth changes (returns unsubscribe function)
   */
  subscribe(listener: (authData: AuthData | null) => void): () => void {
    this.addListener(listener);
    return () => this.removeListener(listener);
  }

  /**
   * Notify all listeners of auth changes
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authData));
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthData> {
    try {
      // Get API base URL from environment
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const authData: AuthData = {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      };

      this.setAuth(authData);

      // Refresh user data to ensure we have the latest balance
      await this.refreshUserData();

      soundService.playWinSound();

      return this.authData || authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(email: string, password: string): Promise<AuthData> {
    try {
      // Get API base URL from environment
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      const authData: AuthData = {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      };

      this.setAuth(authData);
      soundService.playWinSound();

      return authData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }




  /**
   * Logout user
   */
  logout() {
    soundService.playButtonClick();
    this.clearAuth();
  }

  /**
   * Check if authentication is required for an action
   */
  requiresAuth(action: 'bet' | 'deposit' | 'withdraw'): boolean {
    if (!this.isAuthenticated()) {
      return true;
    }

    // Demo mode restrictions
    if (this.isDemoMode()) {
      switch (action) {
        case 'deposit':
        case 'withdraw':
          return false; // Demo users can't deposit/withdraw real money
        case 'bet':
          return false; // Demo users can bet with demo tokens
        default:
          return false;
      }
    }

    return false;
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    const user = this.getUser();
    if (!user) return 'Guest';

    if (user.isDemo) return 'Demo Player';

    return user.email.split('@')[0] || 'Player';
  }

  /**
   * Format balance for display
   */
  getFormattedBalance(): string {
    const user = this.getUser();
    if (!user) return '0.00';

    const suffix = user.isDemo ? ' Demo' : '';
    return `${user.balance.toFixed(2)}${suffix}`;
  }

  /**
   * Debug method to check current auth state
   */
  debugAuthState() {
    console.log('=== Auth Service Debug ===');
    console.log('Current auth data:', this.authData);
    console.log('Is authenticated:', this.isAuthenticated());
    console.log('Current user:', this.getUser());
    console.log('Current balance:', this.getUser()?.balance);
    console.log('Formatted balance:', this.getFormattedBalance());
    console.log('Token:', this.getToken());
    console.log('LocalStorage auth:', localStorage.getItem('auth'));
    console.log('========================');
  }

  /**
   * Start demo mode
   */
  async startDemoMode(): Promise<AuthData> {
    try {
      // Get API base URL from environment
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiBaseUrl}/api/auth/demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for guest ID
      });

      if (!response.ok) {
        // Check if error response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.error || 'Demo mode failed');
        } else {
          throw new Error(`Demo mode failed: ${response.status} ${response.statusText}`);
        }
      }

      // Check if success response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Demo mode returned invalid response format');
      }

      const data = await response.json();
      const authData: AuthData = {
        user: {
          id: data.user.guestId || data.user.id,
          email: `demo-${(data.user.guestId || data.user.id).slice(0, 8)}@demo.local`,
          balance: data.user.balance,
          isDemo: true,
        },
        token: data.token,
        isAuthenticated: true,
        isDemo: true,
      };

      this.setAuth(authData);
      soundService.playNotification();

      return authData;
    } catch (error) {
      console.error('Demo mode error:', error);
      throw error;
    }
  }

  /**
   * Get demo session status
   */
  async getDemoStatus(): Promise<any> {
    try {
      const response = await fetch('/api/auth/demo/status', {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Get demo status error:', error);
      return null;
    }
  }

  /**
   * Reset demo session
   */
  async resetDemoMode(): Promise<AuthData> {
    try {
      const response = await fetch('/api/auth/demo/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // Check if error response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.error || 'Demo reset failed');
        } else {
          throw new Error(`Demo reset failed: ${response.status} ${response.statusText}`);
        }
      }

      // Check if success response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Demo reset returned invalid response format');
      }

      const data = await response.json();
      const authData: AuthData = {
        user: {
          id: data.user.guestId,
          email: `demo-${data.user.guestId.slice(0, 8)}@demo.local`,
          balance: data.user.balance,
          isDemo: true,
        },
        token: data.token,
        isAuthenticated: true,
        isDemo: true,
      };

      this.setAuth(authData);
      soundService.playNotification();

      return authData;
    } catch (error) {
      console.error('Demo reset error:', error);
      throw error;
    }
  }






}

// Singleton instance
export const authService = new AuthService();

// Expose authService globally for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).authService = authService;
}

// React hook for auth service
export function useAuth() {
  return authService;
}
