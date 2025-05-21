/**
 * Authentication Hook
 * 
 * This hook provides access to the authentication service and state.
 * It follows the architecture principles by connecting the UI layer to the service layer.
 */

import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/core/auth/interfaces';
import { User, LoginPayload, RegistrationPayload, AuthResult } from '@/core/auth/models';
import { UserManagementConfiguration } from '@/core/config';

/**
 * Hook for authentication functionality
 * 
 * @returns Authentication state and methods
 */
export function useAuth() {
  // Get the auth service from the service provider registry
  const authService = UserManagementConfiguration.getServiceProvider<AuthService>('authService');
  
  if (!authService) {
    throw new Error('AuthService is not registered in the service provider registry');
  }
  
  // Local state for authentication
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  
  // Update state when auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((updatedUser) => {
      setUser(updatedUser);
      setIsAuthenticated(!!updatedUser);
    });
    
    return () => {
      unsubscribe();
    };
  }, [authService]);
  
  // Login method
  const login = useCallback(async (credentials: LoginPayload): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(credentials);
      
      setIsLoading(false);
      setUser(result.user);
      setIsAuthenticated(!!result.user);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccessMessage('Login successful');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // Register method
  const register = useCallback(async (userData: RegistrationPayload): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(userData);
      
      setIsLoading(false);
      setUser(result.user);
      setIsAuthenticated(!!result.user);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccessMessage('Registration successful');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // Logout method
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      
      setIsLoading(false);
      setUser(null);
      setIsAuthenticated(false);
      setSuccessMessage('Logout successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      
      setIsLoading(false);
      setError(errorMessage);
    }
  }, [authService]);
  
  // Reset password method
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.resetPassword(email);
      
      setIsLoading(false);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.message) {
        setSuccessMessage(result.message);
      } else if (result.success) {
        setSuccessMessage('Password reset email sent');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // Clear any error or success messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);
  
  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    error,
    successMessage,
    
    // Methods
    login,
    register,
    logout,
    resetPassword,
    clearMessages,
    
    // Direct access to the service for advanced operations
    authService
  };
}