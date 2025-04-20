import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { useUserStore } from '../user.store';
import { supabase } from '../../supabase';
import { act } from '@testing-library/react';

// Mock the Supabase client
vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn()
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn()
      }))
    }
  }
}));

// Mock fetch for audit log calls
global.fetch = vi.fn();

describe('User Store', () => {
  const mockUser = {
    user: {
      id: 'user-123',
      email: 'test@example.com'
    }
  };

  const defaultInitialState = {
    profile: null,
    settings: null,
    isLoading: false,
    error: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState(defaultInitialState);
    
    // Reset fetch mock
    (global.fetch as Mock).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
    useUserStore.setState(defaultInitialState);
  });

  it('should initialize with correct default values', () => {
    const state = useUserStore.getState();
    expect(state.profile).toBeNull();
    expect(state.settings).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // Profile Management Tests
  describe('Profile Management', () => {
    const mockProfile = {
      id: 'user-123',
      first_name: 'Test',
      last_name: 'User',
      avatar_url: 'https://example.com/avatar.jpg',
      bio: 'Test bio',
      date_of_birth: '1990-01-01',
      gender: 'other',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      country: 'Test Country',
      postal_code: '12345',
      phone_number: '+1234567890',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    beforeEach(() => {
      (supabase.auth.getUser as Mock).mockResolvedValue(mockUser);
    });

    it('should fetch profile successfully', async () => {
      const mockSupabaseResponse = {
        data: mockProfile,
        error: null
      };

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSupabaseResponse)
          })
        })
      });

      await act(async () => {
        await useUserStore.getState().fetchProfile();
      });

      const state = useUserStore.getState();
      expect(state.profile).toEqual(mockProfile);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle profile fetch error', async () => {
      const mockError = new Error('Failed to fetch profile');
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(mockError)
          })
        })
      });

      await act(async () => {
        try {
          await useUserStore.getState().fetchProfile();
        } catch (error) {
          // Expected error
        }
      });

      const state = useUserStore.getState();
      expect(state.profile).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch profile');
    });

    it('should update profile successfully', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'User'
      };

      const mockSupabaseResponse = {
        error: null
      };

      (supabase.from as Mock).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockSupabaseResponse)
        })
      });

      await act(async () => {
        await useUserStore.getState().updateProfile(updateData);
      });

      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  // Settings Management Tests
  describe('Settings Management', () => {
    const mockSettings = {
      theme: 'dark',
      language: 'en',
      email_notifications: true,
      push_notifications: false,
      two_factor_auth: false,
      login_alerts: true,
      preferences: {}
    };

    beforeEach(() => {
      (supabase.auth.getUser as Mock).mockResolvedValue(mockUser);
    });

    it('should fetch settings successfully', async () => {
      const mockSupabaseResponse = {
        data: mockSettings,
        error: null
      };

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSupabaseResponse)
          })
        })
      });

      await act(async () => {
        await useUserStore.getState().fetchSettings();
      });

      const state = useUserStore.getState();
      expect(state.settings).toEqual(mockSettings);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should update settings successfully', async () => {
      const updateData = {
        theme: 'light',
        language: 'es'
      };

      const mockSupabaseResponse = {
        error: null
      };

      (supabase.from as Mock).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockSupabaseResponse)
        })
      });

      await act(async () => {
        await useUserStore.getState().updateSettings(updateData);
      });

      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  // Avatar Upload Tests
  describe('Avatar Upload', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockPublicUrl = 'https://example.com/avatar.jpg';

    beforeEach(() => {
      (supabase.auth.getUser as Mock).mockResolvedValue(mockUser);
      (supabase.storage.from as Mock).mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: mockPublicUrl } })
      });
    });

    it('should upload avatar successfully', async () => {
      await act(async () => {
        const url = await useUserStore.getState().uploadAvatar(mockFile);
        expect(url).toBe(mockPublicUrl);
      });

      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle avatar upload error', async () => {
      const mockError = new Error('Failed to upload avatar');
      (supabase.storage.from as Mock).mockReturnValue({
        upload: vi.fn().mockRejectedValue(mockError)
      });

      await act(async () => {
        try {
          await useUserStore.getState().uploadAvatar(mockFile);
        } catch (error) {
          // Expected error
        }
      });

      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to upload avatar');
    });
  });

  // Audit Logs Tests
  describe('Audit Logs', () => {
    const mockAuditLogs = {
      logs: [
        {
          id: 1,
          timestamp: '2024-01-01T00:00:00Z',
          user_id: 'user-123',
          method: 'GET',
          path: '/api/profile',
          status_code: 200,
          response_time: 100
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    };

    beforeEach(() => {
      (supabase.auth.getUser as Mock).mockResolvedValue(mockUser);
    });

    it('should fetch audit logs successfully', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuditLogs
      });

      const filters = {
        page: 1,
        limit: 10,
        sortBy: 'timestamp' as const,
        sortOrder: 'desc' as const
      };

      await act(async () => {
        const result = await useUserStore.getState().fetchUserAuditLogs(filters);
        expect(result).toEqual(mockAuditLogs);
      });

      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should export audit logs successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob
      });

      const filters = {
        sortBy: 'timestamp' as const,
        sortOrder: 'desc' as const
      };

      await act(async () => {
        const result = await useUserStore.getState().exportUserAuditLogs(filters);
        expect(result).toEqual(mockBlob);
      });

      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle audit logs fetch error', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to fetch audit logs' })
      });

      const filters = {
        page: 1,
        limit: 10,
        sortBy: 'timestamp' as const,
        sortOrder: 'desc' as const
      };

      await act(async () => {
        try {
          await useUserStore.getState().fetchUserAuditLogs(filters);
        } catch (error) {
          // Expected error
        }
      });

      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch audit logs');
    });
  });
}); 