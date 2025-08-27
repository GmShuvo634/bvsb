// src/components/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import { login, register } from '../components/api';
import { soundService } from '../services/soundService';
import { toast } from 'react-toastify';
import { authService } from '@/services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userData: any) => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register' && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    soundService.playButtonClick();

    try {
      let response;
      if (mode === 'login') {
        response = await login(email, password);
      } else {
        response = await register(email, password);
      }

      if (response.data) {
        // Store auth data
        const authData = {
          user: response.data.user || response.data,
          token: response.data.token,
          isAuthenticated: true
        };

        // Store in localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem('auth', JSON.stringify(authData));
        } else {
          sessionStorage.setItem('auth', JSON.stringify(authData));
        }

        soundService.playWinSound();
        toast.success(mode === 'login' ? 'Login successful!' : 'Registration successful!');
        onAuthSuccess(authData);
        onClose();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Authentication failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoPlay = async () => {
    soundService.playButtonClick();

    // Use authService for consistent demo authentication
    try {
      const authData = await authService.startDemoMode();
      toast.success('Demo mode activated! You have 1000 demo tokens to play with.');
      onAuthSuccess(authData);
      onClose();
    } catch (error) {
      console.error('Demo mode request failed:', error);
      toast.error('Demo mode temporarily unavailable. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-r from-[#181923] to-[#292a3a] border border-[#3f404f] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back!' : 'Join Bears vs Bulls'}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === 'login'
              ? 'Sign in to your account to start betting'
              : 'Create an account to start your betting journey'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#1a1b26] border border-[#3f404f] rounded-lg text-white placeholder-gray-500 focus:border-[#7074b9] focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-[#1a1b26] border border-[#3f404f] rounded-lg text-white placeholder-gray-500 focus:border-[#7074b9] focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-[#1a1b26] border border-[#3f404f] rounded-lg text-white placeholder-gray-500 focus:border-[#7074b9] focus:outline-none"
                placeholder="Confirm your password"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-[#1a1b26] border-[#3f404f] rounded focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-400">
                Remember me
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          {/* Mode Switch */}
          <div className="text-center">
            <span className="text-gray-400 text-sm">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Demo Play */}
          <div className="border-t border-[#3f404f] pt-4">
            <button
              onClick={handleDemoPlay}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
            >
              🎮 Try Demo Mode
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Play with demo tokens - no registration required
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
