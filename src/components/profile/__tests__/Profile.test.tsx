// __tests__/components/Profile.test.js

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import Profile from '../Profile.jsx';
import userEvent from '@testing-library/user-event';

// Import our utility functions
import { setupTestEnvironment } from '@/tests/utils/environment-setup';
import { renderWithProviders, createMockFile } from '@/tests/utils/component-testing-utils';
import { createMockUser, createMockProfile, mockStorage } from '@/tests/utils/testing-utils';

// Import and use our standardized mock
import { describe, test, beforeAll, afterAll, beforeEach, expect, vi } from 'vitest';
vi.mock('@/lib/supabase', async () => await import('@/tests/mocks/supabase'));
import { supabase } from '@/lib/supabase';

describe('Profile Component', () => {
  // Setup test environment and router
  let cleanup: (() => void) | undefined;
  
  beforeAll(() => {
    cleanup = setupTestEnvironment();
  });
  
  afterAll(() => {
    if (cleanup) cleanup();
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
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
    // Create a local builder for this test
    const builder: any = {};
    builder.select = vi.fn().mockReturnValue(builder);
    builder.eq = vi.fn().mockReturnValue(builder);
    builder.single = vi.fn().mockResolvedValue({ data: mockProfileData, error: null });
    builder.update = vi.fn().mockReturnValue(builder);
    builder.upsert = vi.fn().mockReturnValue(builder);
    (supabase.from as any).mockReturnValue(builder);
    
    // Setup storage mocks
    mockStorage('avatars', {
      getPublicUrl: { data: { publicUrl: mockProfileData.avatar_url } }
    });

    // Render with our utility
    renderWithProviders(<Profile user={mockUser} />);

    // Wait for data to load
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
    // Initial builder for fetch
    const initialBuilder: any = {};
    initialBuilder.select = vi.fn().mockReturnValue(initialBuilder);
    initialBuilder.eq = vi.fn().mockReturnValue(initialBuilder);
    initialBuilder.single = vi.fn().mockResolvedValue({ data: mockProfileData, error: null });
    initialBuilder.update = vi.fn().mockReturnValue(initialBuilder);
    initialBuilder.upsert = vi.fn().mockReturnValue(initialBuilder);
    (supabase.from as any).mockReturnValue(initialBuilder);
    
    // Mock storage
    mockStorage('avatars', {
      getPublicUrl: { data: { publicUrl: mockProfileData.avatar_url } }
    });

    // Setup update mock
    const updatedProfile = {
      ...mockProfileData,
      full_name: 'Jane Smith',
      website: 'https://updated-example.com',
    };

    // After update, override with updated builder
    const updateBuilder: any = {};
    updateBuilder.select = vi.fn().mockReturnValue(updateBuilder);
    updateBuilder.eq = vi.fn().mockReturnValue(updateBuilder);
    updateBuilder.single = vi.fn().mockResolvedValue({ data: updatedProfile, error: null });
    updateBuilder.update = vi.fn().mockReturnValue(updateBuilder);
    updateBuilder.upsert = vi.fn().mockReturnValue(updateBuilder);
    (supabase.from as any).mockReturnValue(updateBuilder);

    // Render component
    renderWithProviders(<Profile user={mockUser} />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    // Update form fields
    await userEvent.clear(screen.getByLabelText(/full name/i));
    await userEvent.type(screen.getByLabelText(/full name/i), updatedProfile.full_name);
    await userEvent.clear(screen.getByLabelText(/website/i));
    await userEvent.type(screen.getByLabelText(/website/i), updatedProfile.website);

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /update profile/i }));

    // Verify update was called with correct data
    await waitFor(() => {
      expect(supabase.from('profiles')).toHaveBeenCalledWith('profiles');
      expect(supabase.from('profiles').upsert).toHaveBeenCalledWith({
        id: mockUser.id,
        full_name: updatedProfile.full_name,
        website: updatedProfile.website,
      });
    });
  });

  test('handles avatar upload', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    const builder: any = {};
    builder.select = vi.fn().mockReturnValue(builder);
    builder.eq = vi.fn().mockReturnValue(builder);
    builder.single = vi.fn().mockResolvedValue({ data: mockProfileData, error: null });
    builder.update = vi.fn().mockReturnValue(builder);
    builder.upsert = vi.fn().mockReturnValue(builder);
    (supabase.from as any).mockReturnValue(builder);
    
    // Mock storage
    mockStorage('avatars', {
      getPublicUrl: { data: { publicUrl: mockProfileData.avatar_url } },
      upload: { data: { path: `${mockUser.id}/avatar.jpg` }, error: null }
    });

    // Create a mock file using our utility
    const file = createMockFile('test-avatar.jpg', 'image/jpeg', 1024);
    
    // Render component
    renderWithProviders(<Profile user={mockUser} />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
    });

    // Find the file input and upload a file
    const input = screen.getByLabelText(/upload avatar/i);
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(supabase.storage.from('avatars')).toHaveBeenCalledWith('avatars');
      expect(supabase.storage.from('avatars').upload).toHaveBeenCalledWith(
        `${mockUser.id}/avatar.jpg`,
        file,
        { upsert: true }
      );
    });
  });

  test('displays error message on update failure', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    const builder: any = {};
    builder.select = vi.fn().mockReturnValue(builder);
    builder.eq = vi.fn().mockReturnValue(builder);
    builder.single = vi.fn().mockResolvedValue({ data: mockProfileData, error: null });
    builder.update = vi.fn().mockReturnValue(builder);
    builder.upsert = vi.fn().mockReturnValue(builder);
    builder.upsert = vi.fn().mockReturnValue(builder).mockResolvedValue({ data: null, error: { message: 'Failed to update profile' } });
    (supabase.from as any).mockReturnValue(builder);
    
    // Mock storage
    mockStorage('avatars', {
      getPublicUrl: { data: { publicUrl: mockProfileData.avatar_url } }
    });

    // Mock update error
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
      update: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
      upsert: vi.fn().mockResolvedValue({ data: null, error: { message: 'Failed to update profile' } }),
    });

    // Render component
    renderWithProviders(<Profile user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    // Submit form without changes
    await userEvent.click(screen.getByRole('button', { name: /update profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
    });
  });

  test('handles avatar upload error', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    const builder: any = {};
    builder.select = vi.fn().mockReturnValue(builder);
    builder.eq = vi.fn().mockReturnValue(builder);
    builder.single = vi.fn().mockResolvedValue({ data: mockProfileData, error: null });
    builder.update = vi.fn().mockReturnValue(builder);
    builder.upsert = vi.fn().mockReturnValue(builder);
    (supabase.from as any).mockReturnValue(builder);
    
    // Mock storage with upload error
    mockStorage('avatars', {
      getPublicUrl: { data: { publicUrl: mockProfileData.avatar_url } },
      upload: { data: null, error: { message: 'Failed to upload avatar' } }
    });
    
    // Create a mock file
    const file = createMockFile('test-avatar.jpg');
    
    // Render component
    renderWithProviders(<Profile user={mockUser} />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
    });

    // Find the file input and upload a file
    const input = screen.getByLabelText(/upload avatar/i);
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/failed to upload avatar/i)).toBeInTheDocument();
    });
  });

  test('sanity check - test runner executes this file', () => {
    expect(true).toBe(true);
  });
});
