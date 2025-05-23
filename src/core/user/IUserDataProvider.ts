/**
 * User Data Provider Interface
 *
 * Defines the contract for persistence operations related to user profiles
 * and preferences. This abstraction allows the service layer to remain
 * database-agnostic by delegating all data access to implementations of
 * this interface.
 */
import type {
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
 * Core interface for user data operations.
 *
 * Implementations should focus purely on data persistence and retrieval.
 * Business logic, validation, and transformation should be handled in
 * higher layers of the application.
 */
export interface IUserDataProvider {
  /** Get the profile of a user by ID */
  getUserProfile(userId: string): Promise<UserProfile | null>;

  /** Update a user's profile */
  updateUserProfile(
    userId: string,
    profileData: ProfileUpdatePayload
  ): Promise<UserProfileResult>;

  /** Retrieve a user's preferences */
  getUserPreferences(userId: string): Promise<UserPreferences>;

  /** Update a user's preferences */
  updateUserPreferences(
    userId: string,
    preferences: PreferencesUpdatePayload
  ): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }>;

  /** Upload a profile picture for a user */
  uploadProfilePicture(
    userId: string,
    imageData: Blob
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }>;

  /** Delete a user's profile picture */
  deleteProfilePicture(userId: string): Promise<{ success: boolean; error?: string }>;

  /** Update a user's profile visibility settings */
  updateProfileVisibility(
    userId: string,
    visibility: ProfileVisibility
  ): Promise<{ success: boolean; visibility?: ProfileVisibility; error?: string }>;

  /**
   * Search for users based on various filters.
   *
   * Implementations should support pagination and sorting to allow efficient
   * user directories. The {@link UserSearchParams} object contains optional
   * filters such as `query`, `userType` and `isActive` as well as `page`,
   * `limit`, `sortBy` and `sortDirection` for paging and ordering results.
   *
   * @param params Search and paging parameters
   * @returns A paginated list of users with metadata
   */
  searchUsers(params: UserSearchParams): Promise<UserSearchResult>;

  /** Deactivate a user account */
  deactivateUser(
    userId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }>;

  /** Reactivate a previously deactivated user account */
  reactivateUser(userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Convert a user's account type (e.g., from private to corporate)
   * with optional additional data for the new type.
   */
  convertUserType(
    userId: string,
    newType: string,
    additionalData?: Record<string, any>
  ): Promise<UserProfileResult>;

  /** Subscribe to user profile changes */
  onUserProfileChanged(callback: (profile: UserProfile) => void): () => void;
}

