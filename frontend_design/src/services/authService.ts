// src/services/authService.ts
import { soundService } from './soundService';

export interface User {
  id: string;
  email: string;
  balance: number;
  avatar?: string;
  country?: string;
}

export interface AuthData {
  user: User;
  token: string;
  isAuthenticated: boolean;
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
      soundService.playWinSound();

      return authData;
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
  requiresAuth(): boolean {
    return !this.isAuthenticated();
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    const user = this.getUser();
    if (!user) return 'Guest';

    return user.email.split('@')[0] || 'Player';
  }

  /**
   * Format balance for display
   */
  getFormattedBalance(): string {
    const user = this.getUser();
    if (!user) return '0.00';

    return `${user.balance.toFixed(2)}`;
  }






}

// Singleton instance
export const authService = new AuthService();

// React hook for auth service
export function useAuth() {
  return authService;
}
