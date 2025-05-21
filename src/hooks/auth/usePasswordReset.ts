/**
 * Password Reset Hook
 * 
 * This hook provides password reset functionality.
 * It follows the architecture principles by connecting the UI layer to the service layer.
 */

import { useState, useCallback } from 'react';
import { AuthService } from '@/core/auth/interfaces';
import { UserManagementConfiguration } from '@/core/config';

/**
 * Hook for password reset functionality
 * 
 * @returns Password reset state and methods
 */
export function usePasswordReset() {
  // Get the auth service from the service provider registry
  const authService = UserManagementConfiguration.getServiceProvider<AuthService>('authService');
  
  if (!authService) {
    throw new Error('AuthService is not registered in the service provider registry');
  }
  
  // Local state for password reset
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Request password reset
  const requestReset = useCallback(async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
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
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // Update password
  const updatePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.updatePassword(oldPassword, newPassword);
      
      setIsLoading(false);
      setSuccessMessage('Password updated successfully');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed';
      
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
    isLoading,
    error,
    successMessage,
    
    // Methods
    requestReset,
    updatePassword,
    clearMessages
  };
}

export default usePasswordReset;
