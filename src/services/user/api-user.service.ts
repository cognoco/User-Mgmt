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
import type {
  FileUploadOptions,
  FileUploadResult,
  FileDeleteResult
} from '@/core/storage/interfaces';

/**
 * API-based implementation of {@link UserService} for client-side usage.
 *
 * All operations delegate to REST API endpoints under `/api` and rely on the
 * user's session cookie for authentication. Ensure calls are made over HTTPS to
 * protect sensitive data in transit.
 */
export class ApiUserService implements UserService {
  async getUserProfile(_userId: string): Promise<UserProfile | null> {
    void _userId;
    const res = await fetch('/api/profile', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  }

  /**
   * Update the authenticated user's profile via the API.
   *
   * @param _userId - Ignored client-side parameter
   * @param profileData - Data to update
   * @returns The updated profile or an error message
   */
  async updateUserProfile(
    _userId: string,
    profileData: ProfileUpdatePayload
  ): Promise<UserProfileResult> {
    void _userId;
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'update failed' };
    }
    return { success: true, profile: data.data };
  }

  /**
   * Retrieve the current user's preference settings.
   *
   * @param _userId - Unused parameter for interface compliance
   */
  async getUserPreferences(_userId: string): Promise<UserPreferences> {
    void _userId;
    const res = await fetch('/api/settings', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch preferences');
    const data = await res.json();
    return data.data;
  }

  /**
   * Update user preference settings.
   *
   * @param _userId - Ignored parameter
   * @param preferences - Partial preferences object
   */
  async updateUserPreferences(
    _userId: string,
    preferences: PreferencesUpdatePayload
  ): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }> {
    void _userId;
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(preferences)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'update failed' };
    }
    return { success: true, preferences: data.data };
  }

  /**
   * Upload a new profile picture for the current user.
   *
   * @param _userId - Ignored client-side parameter
   * @param imageData - Image file/blob to upload
   */
  async uploadProfilePicture(
    _userId: string,
    imageData: Blob
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    void _userId;
    const base64 = await imageData.arrayBuffer().then(buf =>
      Buffer.from(buf).toString('base64')
    );
    // Use canonical profile avatar route
    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ avatar: `data:${imageData.type};base64,${base64}` })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'upload failed' };
    }
    return { success: true, imageUrl: data.data.avatarUrl };
  }

  /**
   * Delete the current user's profile picture.
   *
   * @param _userId - Ignored parameter
   */
  async deleteProfilePicture(_userId: string): Promise<{ success: boolean; error?: string }> {
    void _userId;
    // Use canonical profile avatar route
    const res = await fetch('/api/profile/avatar', {
      method: 'DELETE',
      credentials: 'include'
    });
    if (res.status === 204) return { success: true };
    const data = await res.json();
    return { success: res.ok, error: data.error };
  }

  async uploadCompanyLogo(
    _userId: string,
    _companyId: string,
    _fileBuffer: ArrayBuffer,
    _options?: FileUploadOptions
  ): Promise<FileUploadResult> {
    throw new Error('Method not implemented.');
  }

  async deleteCompanyLogo(
    _userId: string,
    _companyId: string
  ): Promise<FileDeleteResult> {
    throw new Error('Method not implemented.');
  }

  /**
   * Update profile visibility settings.
   *
   * @param _userId - Ignored parameter
   * @param visibility - Desired visibility configuration
   */
  async updateProfileVisibility(
    _userId: string,
    visibility: ProfileVisibility
  ): Promise<{ success: boolean; visibility?: ProfileVisibility; error?: string }> {
    void _userId;
    const res = await fetch('/api/profile/privacy', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(visibility)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'update failed' };
    }
    return { success: true, visibility: data }; // privacy route returns object directly
  }

  /**
   * Search users using query parameters.
   *
   * @param params - Filtering and pagination options
   */
  async searchUsers(params: UserSearchParams): Promise<UserSearchResult> {
    const url = `/api/user/search?query=${encodeURIComponent(params.query ?? '')}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('search failed');
    return res.json();
  }

  /**
   * Deactivate the current user account.
   *
   * @param _userId - Ignored
   * @param reason - Optional reason stored for auditing
   */
  async deactivateUser(_userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    void _userId;
    const res = await fetch('/api/retention/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error };
    }
    return { success: true };
  }

  /**
   * Reactivate a previously deactivated account.
   *
   * @param _userId - Ignored parameter
   */
  async reactivateUser(_userId: string): Promise<{ success: boolean; error?: string }> {
    void _userId;
    const res = await fetch('/api/retention/reactivate', {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error };
    }
    return { success: true };
  }

  /**
   * Convert the user's account type.
   *
   * @param _userId - Ignored
   * @param newType - New account type identifier
   * @param additionalData - Extra data required for conversion
   */
  async convertUserType(
    _userId: string,
    newType: string,
    additionalData?: Record<string, any>
  ): Promise<UserProfileResult> {
    void _userId;
    const res = await fetch('/api/user/convert-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ newType, additionalData })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'convert failed' };
    }
    return { success: true, profile: data.data };
  }

  /**
   * Subscribe to profile updates.
   *
   * @returns Unsubscribe function (no-op in this client implementation)
   */
  onUserProfileChanged(): () => void {
    // Client-side implementation could use SSE or websockets; not implemented
    return () => {};
  }
}

/**
 * Factory helper for creating the browser {@link ApiUserService}.
 */
export function getApiUserService(): UserService {
  return new ApiUserService();
}
