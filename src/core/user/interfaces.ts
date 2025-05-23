/**
 * User Management Service Interface
 * 
 * This file defines the core interfaces for the user management domain.
 * Following the interface-first design principle, these interfaces define
 * the contract that any implementation must fulfill.
 */

import { 
  UserProfile, 
  ProfileUpdatePayload, 
  UserPreferences,
  PreferencesUpdatePayload,
  UserProfileResult,
  UserSearchParams,
  UserSearchResult,
  ProfileVisibility
} from './models';

/**
 * Core user management service interface
 *
 * This interface defines all user management operations that can be performed.
 * Any implementation of this interface must provide all these methods.
 *
 * **Error handling:**
 * Methods returning result objects resolve with an `error` property for
 * expected business errors. Other methods should reject their promises when
 * the underlying data provider fails.
 */
export interface UserService {
  /**
   * Get the profile of a user by ID
   * 
   * @param userId ID of the user to fetch
   * @returns User profile data or null if not found
   */
  getUserProfile(userId: string): Promise<UserProfile | null>;
  
  /**
   * Update a user's profile
   * 
   * @param userId ID of the user to update
   * @param profileData Updated profile data
   * @returns Result object with success status and updated profile or error
   */
  updateUserProfile(userId: string, profileData: ProfileUpdatePayload): Promise<UserProfileResult>;
  
  /**
   * Get a user's preferences
   * 
   * @param userId ID of the user to fetch preferences for
   * @returns User preferences or default preferences if not set
   */
  getUserPreferences(userId: string): Promise<UserPreferences>;
  
  /**
   * Update a user's preferences
   * 
   * @param userId ID of the user to update preferences for
   * @param preferences Updated preferences data
   * @returns Result object with success status and updated preferences or error
   */
  updateUserPreferences(userId: string, preferences: PreferencesUpdatePayload): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }>;
  
  /**
   * Upload a profile picture for a user
   * 
   * @param userId ID of the user
   * @param imageData Image data as a File or Blob
   * @returns Result object with success status and image URL or error
   */
  uploadProfilePicture(userId: string, imageData: Blob): Promise<{ success: boolean; imageUrl?: string; error?: string }>;
  
  /**
   * Delete a user's profile picture
   * 
   * @param userId ID of the user
   * @returns Result object with success status or error
   */
  deleteProfilePicture(userId: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Update a user's profile visibility settings
   * 
   * @param userId ID of the user
   * @param visibility Profile visibility settings
   * @returns Result object with success status and updated visibility settings or error
   */
  updateProfileVisibility(userId: string, visibility: ProfileVisibility): Promise<{ success: boolean; visibility?: ProfileVisibility; error?: string }>;
  
  /**
   * Search for users based on search parameters
   * 
   * @param params Search parameters
   * @returns Search results with pagination
   */
  searchUsers(params: UserSearchParams): Promise<UserSearchResult>;
  
  /**
   * Deactivate a user account
   * 
   * @param userId ID of the user to deactivate
   * @param reason Optional reason for deactivation
   * @returns Result object with success status or error
   */
  deactivateUser(userId: string, reason?: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Reactivate a previously deactivated user account
   * 
   * @param userId ID of the user to reactivate
   * @returns Result object with success status or error
   */
  reactivateUser(userId: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Convert a user's account type (e.g., from private to corporate)
   * 
   * @param userId ID of the user
   * @param newType New account type
   * @param additionalData Additional data required for the new account type
   * @returns Result object with success status and updated profile or error
   */
  convertUserType(userId: string, newType: string, additionalData?: Record<string, any>): Promise<UserProfileResult>;
  
  /**
   * Subscribe to user profile changes
   * 
   * @param callback Function to call when a user profile changes
   * @returns Unsubscribe function
   */
  onUserProfileChanged(callback: (profile: UserProfile) => void): () => void;
}

/**
 * User management state interface
 * 
 * This interface defines the user management state that can be observed.
 */
export interface UserState {
  /**
   * Current user profile or null if not loaded
   */
  profile: UserProfile | null;
  
  /**
   * Current user preferences or null if not loaded
   */
  preferences: UserPreferences | null;
  
  /**
   * True if user operations are in progress
   */
  isLoading: boolean;
  
  /**
   * Error message if a user operation failed
   */
  error: string | null;
  
  /**
   * Success message after a successful operation
   */
  successMessage: string | null;
}
