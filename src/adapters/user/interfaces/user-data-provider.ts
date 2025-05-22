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

/**
 * Interface for user data provider
 * This interface defines the contract for any data provider that handles user-related operations
 */
export interface UserDataProvider {
  /**
   * Get user by ID
   * @param userId - The ID of the user to fetch
   */
  getUserById(userId: string): Promise<UserProfile | null>;

  /**
   * Get users by role
   * @param role - The role to filter users by
   */
  getUsersByRole(role: string): Promise<UserProfile[]>;

  /**
   * Update user role
   * @param userId - The ID of the user to update
   * @param role - The new role
   */
  updateUserRole(userId: string, role: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Search users
   * @param params - Search parameters
   */
  searchUsers(params: UserSearchParams): Promise<UserSearchResult>;

  /**
   * Update user profile
   * @param userId - The ID of the user to update
   * @param profileData - The updated profile data
   */
  updateUserProfile(userId: string, profileData: ProfileUpdatePayload): Promise<UserProfileResult>;

  /**
   * Get user preferences
   * @param userId - The ID of the user
   */
  getUserPreferences(userId: string): Promise<UserPreferences>;

  /**
   * Update user preferences
   * @param userId - The ID of the user
   * @param preferences - The updated preferences
   */
  updateUserPreferences(userId: string, preferences: PreferencesUpdatePayload): Promise<{ success: boolean; preferences: UserPreferences; error?: string }>;

  /**
   * Upload profile picture
   * @param userId - The ID of the user
   * @param imageData - The image data to upload
   */
  uploadProfilePicture(userId: string, imageData: Blob): Promise<{ success: boolean; imageUrl?: string; error?: string }>;

  /**
   * Delete profile picture
   * @param userId - The ID of the user
   */
  deleteProfilePicture(userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Update profile visibility
   * @param userId - The ID of the user
   * @param visibility - The new visibility settings
   */
  updateProfileVisibility(userId: string, visibility: ProfileVisibility): Promise<{ success: boolean; visibility: ProfileVisibility; error?: string }>;

  /**
   * Deactivate user
   * @param userId - The ID of the user to deactivate
   * @param reason - Optional reason for deactivation
   */
  deactivateUser(userId: string, reason?: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Reactivate user
   * @param userId - The ID of the user to reactivate
   */
  reactivateUser(userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Convert user type
   * @param userId - The ID of the user
   * @param newType - The new account type
   * @param additionalData - Additional data required for the new account type
   */
  convertUserType(userId: string, newType: string, additionalData?: Record<string, any>): Promise<UserProfileResult>;
}

export * from '@/core/user/interfaces';
