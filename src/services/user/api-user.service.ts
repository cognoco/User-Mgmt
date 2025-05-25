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

/**
 * API-based implementation of {@link UserService} for client-side usage.
 * All operations delegate to REST API endpoints under `/api`.
 */
export class ApiUserService implements UserService {
  async getUserProfile(_userId: string): Promise<UserProfile | null> {
    void _userId;
    const res = await fetch('/api/user/profile', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  }

  async updateUserProfile(
    _userId: string,
    profileData: ProfileUpdatePayload
  ): Promise<UserProfileResult> {
    void _userId;
    const res = await fetch('/api/user/profile', {
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

  async getUserPreferences(_userId: string): Promise<UserPreferences> {
    void _userId;
    const res = await fetch('/api/user/settings', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch preferences');
    const data = await res.json();
    return data.data;
  }

  async updateUserPreferences(
    _userId: string,
    preferences: PreferencesUpdatePayload
  ): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }> {
    void _userId;
    const res = await fetch('/api/user/settings', {
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

  async uploadProfilePicture(
    _userId: string,
    imageData: Blob
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    void _userId;
    const base64 = await imageData.arrayBuffer().then(buf =>
      Buffer.from(buf).toString('base64')
    );
    const res = await fetch('/api/user/avatar', {
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

  async deleteProfilePicture(_userId: string): Promise<{ success: boolean; error?: string }> {
    void _userId;
    const res = await fetch('/api/user/avatar', {
      method: 'DELETE',
      credentials: 'include'
    });
    if (res.status === 204) return { success: true };
    const data = await res.json();
    return { success: res.ok, error: data.error };
  }

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

  async searchUsers(params: UserSearchParams): Promise<UserSearchResult> {
    const url = `/api/user/search?query=${encodeURIComponent(params.query ?? '')}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('search failed');
    return res.json();
  }

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

  onUserProfileChanged(): () => void {
    // Client-side implementation could use SSE or websockets; not implemented
    return () => {};
  }
}

export function getApiUserService(): UserService {
  return new ApiUserService();
}
