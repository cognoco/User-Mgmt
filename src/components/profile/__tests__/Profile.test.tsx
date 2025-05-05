// __tests__/components/Profile.test.js

import React from 'react';
import { screen, waitFor, act, cleanup as testingLibraryCleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import our utility functions
import { setupTestEnvironment } from '@/tests/utils/environment-setup';
import { renderWithProviders, createMockFile } from '@/tests/utils/component-testing-utils';
import { createMockUser, createMockProfile } from '@/tests/utils/testing-utils';

// Import and use our standardized mock
import { describe, test, beforeAll, afterAll, beforeEach, expect, vi } from 'vitest';
vi.mock('@/lib/supabase', async () => await import('@/tests/mocks/supabase'));
import { supabase } from '@/lib/supabase';

// Add global error handlers for debugging
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('UNCAUGHT EXCEPTION:', err);
});

describe('Profile Component', () => {
  // Setup test environment and router
  let cleanupEnv: (() => void) | undefined;
  let storageFromSpy: any;
  let uploadSpy: any;
  let getPublicUrlSpy: any;

  beforeAll(() => {
    console.log('[DEBUG] beforeAll - Profile Component');
    cleanupEnv = setupTestEnvironment();
  });

  afterAll(() => {
    console.log('[DEBUG] afterAll - Profile Component');
    try {
      if (cleanupEnv) cleanupEnv();
    } catch (err) {
      console.error('Error in afterAll cleanup:', err);
    }
  });

  beforeEach(() => {
    console.log('[DEBUG] beforeEach - Profile Component');
    vi.resetModules();
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
    console.log('[DEBUG] supabase.from mock:', supabase.from);
    console.log('[DEBUG] supabase.storage.from mock:', supabase.storage.from);
  });

  afterEach(() => {
    console.log('[DEBUG] afterEach - Profile Component');
    try {
      testingLibraryCleanup();
    } catch (err) {
      console.error('Error in afterEach cleanup:', err);
    }
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
    console.log('[DEBUG] TEST START: renders profile form with user data');
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
    await act(async () => {
      renderWithProviders(<Profile user={mockUser} />);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByAltText(/avatar/i)).toHaveAttribute('src', mockProfileData.avatar_url);
    });
    console.log('[DEBUG] TEST END: renders profile form with user data');
  });

  test('handles profile update', async () => {
    console.log('[DEBUG] TEST START: handles profile update');
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
    await act(async () => {
      renderWithProviders(<Profile user={mockUser} />);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
    await act(async () => {
      await userEvent.clear(screen.getByLabelText(/full name/i));
      await userEvent.type(screen.getByLabelText(/full name/i), updatedProfile.full_name);
      await userEvent.clear(screen.getByLabelText(/website/i));
      await userEvent.type(screen.getByLabelText(/website/i), updatedProfile.website);
      await userEvent.click(screen.getByRole('button', { name: /update profile/i }));
    });
    // Only expect the updated value after update
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://updated-example.com')).toBeInTheDocument();
    });
    console.log('[DEBUG] TEST END: handles profile update');
  });

  test('handles avatar upload', async () => {
    console.log('[DEBUG] TEST START: handles avatar upload');
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    // Mock profile fetch AND the subsequent update/eq chain
    let currentProfile = { ...mockProfileData };
    // Create a separate spy for the .eq method
    const eqSpy = vi.fn().mockImplementation((_idKey, _idValue) => {
      // Simulate update for avatar_url
      // No need to update currentProfile here, just resolve the promise
      return Promise.resolve({ data: [{}], error: null }); // Return minimal success data
    });
    const updateSpy = vi.fn().mockImplementation((updates) => {
      // Store the updates for assertion later
      currentProfile = { ...currentProfile, ...updates };
      // Return the object containing the eq spy
      return { eq: eqSpy };
    });

    const profileBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(), // For initial fetch
      single: vi.fn().mockImplementation(() => Promise.resolve({ data: currentProfile, error: null })), // For initial fetch
      update: updateSpy, // Use the update spy
    };
    (supabase.from as any) = vi.fn((table: string) => (table === 'profiles' ? profileBuilder : {}));

    const Profile = (await import('../Profile.jsx')).default;
    await act(async () => {
      renderWithProviders(<Profile user={mockUser} />);
    });

    await waitFor(() => {
      expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
    });

    await act(async () => {
      const input = screen.getByLabelText(/upload avatar/i);
      const file = createMockFile('test-avatar.jpg', 'image/jpeg', 1024);
      await userEvent.upload(input, file);
    });

    // Wait for all promises to resolve
    await waitFor(() => {
      // Check storage calls
      expect(storageFromSpy).toHaveBeenCalledWith('avatars');
      expect(uploadSpy).toHaveBeenCalledWith(expect.any(String), expect.any(File));
      expect(getPublicUrlSpy).toHaveBeenCalled();

      // Check profile update mock was called correctly
      expect(updateSpy).toHaveBeenCalledWith({ avatar_url: 'https://example.com/avatar.jpg', updated_at: expect.any(String) });
      // Check that the eq spy (returned by updateSpy) was called correctly
      expect(eqSpy).toHaveBeenCalledWith('id', mockUser.id);
    });
    console.log('[DEBUG] TEST END: handles avatar upload');
  });

  test('displays error message on update failure', async () => {
    console.log('[DEBUG] TEST START: displays error message on update failure');
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
    await act(async () => {
      renderWithProviders(<Profile user={mockUser} />);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /update profile/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to update profile|Error updating profile/i)).toBeInTheDocument();
    });
    console.log('[DEBUG] TEST END: displays error message on update failure');
  });

  test('handles avatar upload error', async () => {
    console.log('[DEBUG] TEST START: handles avatar upload error');
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
    // Mock profile fetch (update won't be called if upload fails)
    const profileBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
      // No need to mock update/eq here as it shouldn't be reached
    };
    (supabase.from as any) = vi.fn((table: string) => (table === 'profiles' ? profileBuilder : {}));

    // Override uploadSpy to simulate error BEFORE profile update attempt
    uploadSpy.mockResolvedValue({ data: null, error: { message: 'Failed to upload avatar' } });

    const Profile = (await import('../Profile.jsx')).default;
    await act(async () => {
      renderWithProviders(<Profile user={mockUser} />);
    });
    await waitFor(() => {
      expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
    });
    await act(async () => {
      const input = screen.getByLabelText(/upload avatar/i);
      const file = createMockFile('test-avatar.jpg');
      await userEvent.upload(input, file);
    });
    await waitFor(() => {
      expect(screen.getByText(/Error uploading avatar/i)).toBeInTheDocument();
    });
    console.log('[DEBUG] TEST END: handles avatar upload error');
  });

  test('sanity check - test runner executes this file', () => {
    console.log('[DEBUG] TEST START: sanity check');
    expect(true).toBe(true);
    console.log('[DEBUG] TEST END: sanity check');
  });
});
