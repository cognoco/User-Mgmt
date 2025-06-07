/**
 * Account Settings Hook
 * 
 * This hook provides account settings and preferences management functionality.
 * It follows the architecture principles by connecting the UI layer to the service layer.
 */

import { useState, useEffect, useCallback } from 'react';
import { UserService } from '@/core/user/interfaces';
import { 
  UserPreferences, 
  PreferencesUpdatePayload 
} from '@/core/user/models';
import { UserManagementConfiguration } from '@/core/config';
import { useAuth } from '@/hooks/auth/useAuth';

/**
 * Hook for account settings and preferences management
 * 
 * @returns Account settings state and methods
 */
export function useAccountSettings() {
  // Get the user service from the service provider registry
  const userService = UserManagementConfiguration.getServiceProvider<UserService>('userService');
  
  if (!userService) {
    throw new Error('UserService is not registered in the service provider registry');
  }
  
  // Get current user from auth hook
  const { user } = useAuth();
  
  // Local state for user preferences
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Fetch user preferences
  const fetchUserPreferences = useCallback(async (userId: string): Promise<UserPreferences | null> => {
    if (!userId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userPreferences = await userService.getUserPreferences(userId);
      
      setIsLoading(false);
      setPreferences(userPreferences);
      
      return userPreferences;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user preferences';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return null;
    }
  }, [userService]);
  
  // Update user preferences
  const updatePreferences = useCallback(async (
    userId: string, 
    preferencesData: PreferencesUpdatePayload
  ): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await userService.updateUserPreferences(userId, preferencesData);
      
      setIsLoading(false);
      
      if (result.success && result.preferences) {
        setPreferences(result.preferences);
        setSuccessMessage('Preferences updated successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [userService]);
  
  // Deactivate user account
  const deactivateAccount = useCallback(async (
    userId: string, 
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await userService.deactivateUser(userId, reason);
      
      setIsLoading(false);
      
      if (result.success) {
        setSuccessMessage('Account deactivated successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate account';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [userService]);
  
  // Reactivate user account
  const reactivateAccount = useCallback(async (
    userId: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await userService.reactivateUser(userId);
      
      setIsLoading(false);
      
      if (result.success) {
        setSuccessMessage('Account reactivated successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reactivate account';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [userService]);
  
  // Convert user account type
  const convertAccountType = useCallback(async (
    userId: string, 
    newType: string, 
    additionalData?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await userService.convertUserType(userId, newType, additionalData);
      
      setIsLoading(false);
      
      if (result.success) {
        setSuccessMessage(`Account converted to ${newType} successfully`);
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert account type';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [userService]);
  
  // Clear any error or success messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);
  
  // Fetch the current user's preferences when the component mounts or the user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserPreferences(user.id);
    }
  }, [user, fetchUserPreferences]);
  
  return {
    // State
    preferences,
    isLoading,
    error,
    successMessage,
    
    // Methods
    fetchUserPreferences,
    updatePreferences,
    deactivateAccount,
    reactivateAccount,
    convertAccountType,
    clearMessages
  };
}

export default useAccountSettings;
