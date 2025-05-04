// __tests__/components/Profile.test.js

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import our utility functions
import { setupTestEnvironment } from '@/tests/utils/environment-setup';
import { renderWithProviders, createMockFile } from '@/tests/utils/component-testing-utils';
import { createMockUser, createMockProfile } from '@/tests/utils/testing-utils';

// Import and use our standardized mock
import { describe, test, beforeAll, afterAll, beforeEach, expect, vi } from 'vitest';
vi.mock('@/lib/supabase', async () => await import('@/tests/mocks/supabase'));
import { supabase } from '@/lib/supabase';

describe('Profile Component', () => {
  // Setup test environment and router
  let cleanup: (() => void) | undefined;
  let storageFromSpy: any;
  let uploadSpy: any;
  let getPublicUrlSpy: any;

  beforeAll(() => {
    cleanup = setupTestEnvironment();
  });
  
  afterAll(() => {
    if (cleanup) cleanup();
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Always inject a fresh spy for supabase.storage.from
    uploadSpy = vi.fn().mockResolvedValue({ data: { path: 'test-user-id/avatar.jpg' }, error: null });
    getPublicUrlSpy = vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/avatar.jpg' } });
    storageFromSpy = vi.fn().mockReturnValue({ upload: uploadSpy, getPublicUrl: getPublicUrlSpy });
    Object.defineProperty(supabase.storage, 'from', { value: storageFromSpy, configurable: true });
    // Default: ensure supabase.from returns a builder with all needed methods mocked
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    (supabase.from as any).mockReturnValue(builder);
  });

  // Create mock user and profile data
  const mockUser = createMockUser();
  const mockProfileData = createMockProfile({
    id: mockUser.id,
    full_name: 'John Doe',
    website: 'https://example.com',
    avatar_url: 'https://example.com/avatar.jpg'
  });

  test('renders profile form with user data', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    // Directly mock supabase.from for 'profiles'
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
    };
    (supabase.from as any) = vi.fn((table: string) => (table === 'profiles' ? builder : {}));
    const Profile = (await import('../Profile.jsx')).default;
    renderWithProviders(<Profile user={mockUser} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByAltText(/avatar/i)).toHaveAttribute('src', mockProfileData.avatar_url);
    });
  });

  test('handles profile update', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    // Initial fetch returns original profile
    let currentProfile = mockProfileData;
    // Builder chain: update returns an object with eq, eq returns a promise
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => Promise.resolve({ data: currentProfile, error: null })),
      update: vi.fn().mockImplementation((updates) => ({
        eq: vi.fn().mockImplementation(() => {
          currentProfile = { ...currentProfile, ...updates };
          return Promise.resolve({ data: currentProfile, error: null });
        })
      })),
    };
    (supabase.from as any) = vi.fn((table: string) => (table === 'profiles' ? builder : {}));
    const updatedProfile = {
      ...mockProfileData,
      full_name: 'Jane Smith',
      website: 'https://updated-example.com',
    };
    const Profile = (await import('../Profile.jsx')).default;
    renderWithProviders(<Profile user={mockUser} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
    await userEvent.clear(screen.getByLabelText(/full name/i));
    await userEvent.type(screen.getByLabelText(/full name/i), updatedProfile.full_name);
    await userEvent.clear(screen.getByLabelText(/website/i));
    await userEvent.type(screen.getByLabelText(/website/i), updatedProfile.website);
    await userEvent.click(screen.getByRole('button', { name: /update profile/i }));
    // Only expect the updated value after update
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://updated-example.com')).toBeInTheDocument();
    });
  });

  test('handles avatar upload', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    // Mock profile fetch
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
      update: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
    };
    (supabase.from as any) = vi.fn((table: string) => (table === 'profiles' ? builder : {}));
    const Profile = (await import('../Profile.jsx')).default;
    renderWithProviders(<Profile user={mockUser} />);
    await waitFor(() => {
      expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
    });
    const input = screen.getByLabelText(/upload avatar/i);
    const file = createMockFile('test-avatar.jpg', 'image/jpeg', 1024);
    await userEvent.upload(input, file);
    await waitFor(() => {
      expect(storageFromSpy).toHaveBeenCalledWith('avatars');
      expect(uploadSpy).toHaveBeenCalledWith(expect.any(String), file);
      expect(getPublicUrlSpy).toHaveBeenCalled();
    });
  });

  test('displays error message on update failure', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
    // Builder chain: update returns an object with eq, eq returns a rejected promise
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
      update: vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockImplementation(() => Promise.reject({ message: 'Failed to update profile' }))
      })),
    };
    (supabase.from as any) = vi.fn((table: string) => (table === 'profiles' ? builder : {}));
    const Profile = (await import('../Profile.jsx')).default;
    renderWithProviders(<Profile user={mockUser} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /update profile/i }));
    await waitFor(() => {
      expect(screen.getByText(/Failed to update profile|Error updating profile/i)).toBeInTheDocument();
    });
  });

  test('handles avatar upload error', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    // Mock profile fetch
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
      update: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
    };
    (supabase.from as any) = vi.fn((table: string) => (table === 'profiles' ? builder : {}));
    // Override uploadSpy to simulate error
    uploadSpy.mockResolvedValue({ data: null, error: { message: 'Failed to upload avatar' } });
    const Profile = (await import('../Profile.jsx')).default;
    renderWithProviders(<Profile user={mockUser} />);
    await waitFor(() => {
      expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
    });
    const input = screen.getByLabelText(/upload avatar/i);
    const file = createMockFile('test-avatar.jpg');
    await userEvent.upload(input, file);
    await waitFor(() => {
      expect(screen.getByText(/Error uploading avatar/i)).toBeInTheDocument();
    });
  });

  test('sanity check - test runner executes this file', () => {
    expect(true).toBe(true);
  });
});
