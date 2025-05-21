/**
 * Default User Service Implementation
 * 
 * This file implements the UserService interface defined in the core layer.
 * It provides the default implementation for user management operations.
 */

import { UserService } from '@/core/user/interfaces';
import { 
  UserProfile, 
  ProfileUpdatePayload, 
  UserPreferences,
  PreferencesUpdatePayload,
  UserProfileResult,
  UserSearchParams,
  UserSearchResult,
  ProfileVisibility
} from '@/core/user/models';
import { UserEventType } from '@/core/user/events';
import { translateError } from '@/lib/utils/error';
import { TypedEventEmitter } from '@/lib/utils/typed-event-emitter';

/**
 * Default implementation of the UserService interface
 */
export class DefaultUserService
  extends TypedEventEmitter<UserEventType>
  implements UserService
{
  
  /**
   * Constructor for DefaultUserService
   * 
   * @param apiClient - The API client for making HTTP requests
   * @param userDataProvider - The data provider for user operations
   */
  constructor(
    private apiClient: any, // This would be replaced with a proper API client interface
    private userDataProvider: any // This would be replaced with a proper user data provider interface
  ) {
    super();
  }

  /**
   * Emit a user event
   * 
   * @param event - The event to emit
   */
  private emitEvent(event: UserEventType): void {
    this.emit(event);
  }

  /**
   * Get the profile of a user by ID
   * 
   * @param userId - ID of the user to fetch
   * @returns User profile data or null if not found
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await this.apiClient.get(`/api/users/${userId}/profile`);
      return response.data.profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update a user's profile
   * 
   * @param userId - ID of the user to update
   * @param profileData - Updated profile data
   * @returns Result object with success status and updated profile or error
   */
  async updateUserProfile(userId: string, profileData: ProfileUpdatePayload): Promise<UserProfileResult> {
    try {
      const response = await this.apiClient.put(`/api/users/${userId}/profile`, profileData);
      
      // Emit profile updated event
      this.emitEvent({
        type: 'user_profile_updated',
        timestamp: Date.now(),
        userId,
        profile: response.data.profile,
        updatedFields: Object.keys(profileData)
      });
      
      return {
        success: true,
        profile: response.data.profile
      };
    } catch (error: any) {
      const errorMessage = translateError(error, { defaultMessage: 'Failed to update user profile' });
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get a user's preferences
   * 
   * @param userId - ID of the user to fetch preferences for
   * @returns User preferences or default preferences if not set
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const response = await this.apiClient.get(`/api/users/${userId}/preferences`);
      return response.data.preferences;
    } catch (error) {
      // Return default preferences if not found
      return {
        language: 'en',
        theme: 'system',
        emailNotifications: {
          marketing: false,
          securityAlerts: true,
          accountUpdates: true,
          teamInvitations: true
        },
        pushNotifications: {
          enabled: false,
          events: []
        }
      };
    }
  }

  /**
   * Update a user's preferences
   * 
   * @param userId - ID of the user to update preferences for
   * @param preferences - Updated preferences data
   * @returns Result object with success status and updated preferences or error
   */
  async updateUserPreferences(userId: string, preferences: PreferencesUpdatePayload): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }> {
    try {
      const response = await this.apiClient.put(`/api/users/${userId}/preferences`, preferences);
      
      // Emit preferences updated event
      this.emitEvent({
        type: 'user_preferences_updated',
        timestamp: Date.now(),
        userId,
        preferences: response.data.preferences,
        updatedFields: Object.keys(preferences)
      });
      
      return {
        success: true,
        preferences: response.data.preferences
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update user preferences';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Upload a profile picture for a user
   * 
   * @param userId - ID of the user
   * @param imageData - Image data as a File or Blob
   * @returns Result object with success status and image URL or error
   */
  async uploadProfilePicture(userId: string, imageData: Blob): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageData);
      
      const response = await this.apiClient.post(`/api/users/${userId}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Emit profile picture uploaded event
      this.emitEvent({
        type: 'profile_picture_uploaded',
        timestamp: Date.now(),
        userId,
        imageUrl: response.data.imageUrl
      });
      
      return {
        success: true,
        imageUrl: response.data.imageUrl
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to upload profile picture';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Delete a user's profile picture
   * 
   * @param userId - ID of the user
   * @returns Result object with success status or error
   */
  async deleteProfilePicture(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.apiClient.delete(`/api/users/${userId}/profile-picture`);
      
      // Emit profile picture deleted event
      this.emitEvent({
        type: 'profile_picture_deleted',
        timestamp: Date.now(),
        userId
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete profile picture';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Update a user's profile visibility settings
   * 
   * @param userId - ID of the user
   * @param visibility - Profile visibility settings
   * @returns Result object with success status and updated visibility settings or error
   */
  async updateProfileVisibility(userId: string, visibility: ProfileVisibility): Promise<{ success: boolean; visibility?: ProfileVisibility; error?: string }> {
    try {
      const response = await this.apiClient.put(`/api/users/${userId}/visibility`, { visibility });
      
      // Emit profile visibility updated event
      this.emitEvent({
        type: 'profile_visibility_updated',
        timestamp: Date.now(),
        userId,
        visibility: response.data.visibility
      });
      
      return {
        success: true,
        visibility: response.data.visibility
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile visibility';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Search for users based on search parameters
   * 
   * @param params - Search parameters
   * @returns Search results with pagination
   */
  async searchUsers(params: UserSearchParams): Promise<UserSearchResult> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      const response = await this.apiClient.get(`/api/users/search?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      // Return empty result on error
      return {
        users: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 0
      };
    }
  }

  /**
   * Deactivate a user account
   * 
   * @param userId - ID of the user to deactivate
   * @param reason - Optional reason for deactivation
   * @returns Result object with success status or error
   */
  async deactivateUser(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.apiClient.post(`/api/users/${userId}/deactivate`, { reason });
      
      // Emit user deactivated event
      this.emitEvent({
        type: 'user_deactivated',
        timestamp: Date.now(),
        userId,
        reason
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = translateError(error, { defaultMessage: 'Failed to deactivate user' });
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Reactivate a previously deactivated user account
   * 
   * @param userId - ID of the user to reactivate
   * @returns Result object with success status or error
   */
  async reactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.apiClient.post(`/api/users/${userId}/reactivate`);
      
      // Emit user reactivated event
      this.emitEvent({
        type: 'user_reactivated',
        timestamp: Date.now(),
        userId
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to reactivate user';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Convert a user's account type (e.g., from private to corporate)
   * 
   * @param userId - ID of the user
   * @param newType - New account type
   * @param additionalData - Additional data required for the new account type
   * @returns Result object with success status and updated profile or error
   */
  async convertUserType(userId: string, newType: string, additionalData?: Record<string, any>): Promise<UserProfileResult> {
    try {
      const response = await this.apiClient.post(`/api/users/${userId}/convert-type`, {
        newType,
        additionalData
      });
      
      // Get the previous type before conversion
      const previousProfile = await this.getUserProfile(userId);
      const previousType = previousProfile?.userType || 'unknown';
      
      // Emit user type converted event
      this.emitEvent({
        type: 'user_type_converted',
        timestamp: Date.now(),
        userId,
        previousType,
        newType
      });
      
      return {
        success: true,
        profile: response.data.profile
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to convert user type';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Subscribe to user profile changes
   * 
   * @param callback - Function to call when a user profile changes
   * @returns Unsubscribe function
   */
  onUserProfileChanged(callback: (profile: UserProfile) => void): () => void {
    return this.onType('user_profile_updated', event => {
      callback(event.profile);
    });
  }
}
