/**
 * User Repository Interface
 *
 * Defines the contract for low level database operations related to users.
 * Repository implementations should focus purely on persistence and retrieval
 * and remain free of business logic. All methods return a Promise and never
 * throw synchronous errors. Errors should be surfaced via the resolved value
 * using an `error` property or by rejecting the promise when the underlying
 * driver fails unexpectedly.
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
} from '@/core/user/models';

/** Payload for creating a new user */
export interface UserCreatePayload extends ProfileUpdatePayload {
  /** Email for the new user */
  email: string;
  /** Optional hashed password depending on implementation */
  passwordHash?: string;
}

export interface IUserRepository {
  /** Find a user by their unique identifier */
  findById(userId: string): Promise<UserProfile | null>;

  /** Find a user by their email address */
  findByEmail(email: string): Promise<UserProfile | null>;

  /**
   * Persist a new user in the database.
   *
   * @param data - User creation payload
   * @returns Operation result with created profile or error information
   */
  createUser(data: UserCreatePayload): Promise<UserProfileResult>;

  /**
   * Update an existing user's profile information.
   *
   * @param userId - Identifier of the user to update
   * @param update - Partial profile fields
   * @returns Result with updated profile or error message
   */
  updateProfile(userId: string, update: ProfileUpdatePayload): Promise<UserProfileResult>;

  /** Retrieve a user's preferences */
  getUserPreferences(userId: string): Promise<UserPreferences>;

  /** Update a user's preferences */
  updateUserPreferences(
    userId: string,
    preferences: PreferencesUpdatePayload
  ): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }>;

  /** Upload a new profile picture for the user */
  uploadProfilePicture(
    userId: string,
    imageData: Blob
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }>;

  /** Remove a user's profile picture */
  deleteProfilePicture(userId: string): Promise<{ success: boolean; error?: string }>;

  /** Update profile visibility settings */
  updateProfileVisibility(
    userId: string,
    visibility: ProfileVisibility
  ): Promise<{ success: boolean; visibility?: ProfileVisibility; error?: string }>;

  /** Search for users based on various filters */
  searchUsers(params: UserSearchParams): Promise<UserSearchResult>;

  /** Deactivate a user account */
  deactivateUser(
    userId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }>;

  /** Reactivate a previously deactivated user account */
  reactivateUser(userId: string): Promise<{ success: boolean; error?: string }>;

  /** Convert a user's account type */
  convertUserType(
    userId: string,
    newType: string,
    additionalData?: Record<string, any>
  ): Promise<UserProfileResult>;

  /** Subscribe to user profile change events */
  onUserProfileChanged(callback: (profile: UserProfile) => void): () => void;
}
