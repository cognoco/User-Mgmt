import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProfilePrivacySettings } from '@/ui/styled/profile/ProfilePrivacySettings';
import { useProfileStore } from '@/lib/stores/profile.store';
import { usePermission } from '@/hooks/permission/usePermissions';

// Mock the stores and hooks
vi.mock('@/lib/stores/profile.store');
vi.mock('@/hooks/permission/usePermissions');

describe('ProfilePrivacySettings', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock profile store with default values
    vi.mocked(useProfileStore).mockReturnValue({
      profile: {
        id: 'test-id',
        isPublic: true,
        showLocation: true,
        showEmail: false,
        visibility: {
          profile: 'public',
          location: 'connections',
          email: 'private'
        }
      },
      isLoading: false,
      error: null,
      updatePrivacySettings: vi.fn().mockResolvedValue({}),
      updateVisibilitySettings: vi.fn().mockResolvedValue({})
    });

    // Mock permission hook
    vi.mocked(usePermission).mockReturnValue({
      hasPermission: true,
      isLoading: false
    });
  });

  test('renders privacy settings form with current values', async () => {
    await act(async () => {
      render(<ProfilePrivacySettings />);
    });
    
    // Check if all privacy toggles are rendered
    expect(screen.getByLabelText(/public profile/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/show location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/show email/i)).toBeInTheDocument();
    
    // Check initial toggle states
    expect(screen.getByLabelText(/public profile/i)).toBeChecked();
    expect(screen.getByLabelText(/show location/i)).toBeChecked();
    expect(screen.getByLabelText(/show email/i)).not.toBeChecked();
  });

  test('updates profile visibility setting', async () => {
    const mockUpdateVisibilitySettings = vi.fn().mockResolvedValue({});
    vi.mocked(useProfileStore).mockReturnValue({
      profile: {
        id: 'test-id',
        isPublic: true,
        showLocation: true,
        showEmail: false,
        visibility: {
          profile: 'public',
          location: 'connections',
          email: 'private'
        }
      },
      isLoading: false,
      error: null,
      updatePrivacySettings: vi.fn(),
      updateVisibilitySettings: mockUpdateVisibilitySettings
    });

    await act(async () => {
      render(<ProfilePrivacySettings />);
    });
    
    // Change profile visibility
    await user.click(screen.getByLabelText(/public profile/i));
    
    // Verify API call
    await waitFor(() => {
      expect(mockUpdateVisibilitySettings).toHaveBeenCalledWith({
        profile: 'private',
        location: 'connections',
        email: 'private'
      });
    });
  });

  test('updates location visibility setting', async () => {
    const mockUpdateVisibilitySettings = vi.fn().mockResolvedValue({});
    vi.mocked(useProfileStore).mockReturnValue({
      profile: {
        id: 'test-id',
        isPublic: true,
        showLocation: true,
        showEmail: false,
        visibility: {
          profile: 'public',
          location: 'connections',
          email: 'private'
        }
      },
      isLoading: false,
      error: null,
      updatePrivacySettings: vi.fn(),
      updateVisibilitySettings: mockUpdateVisibilitySettings
    });

    await act(async () => {
      render(<ProfilePrivacySettings />);
    });
    
    // Change location visibility
    await user.selectOptions(screen.getByLabelText(/location visibility/i), 'public');
    
    // Verify API call
    await waitFor(() => {
      expect(mockUpdateVisibilitySettings).toHaveBeenCalledWith({
        profile: 'public',
        location: 'public',
        email: 'private'
      });
    });
  });

  test('shows loading state during updates', async () => {
    vi.mocked(useProfileStore).mockReturnValue({
      profile: {
        id: 'test-id',
        isPublic: true,
        showLocation: true,
        showEmail: false,
        visibility: {
          profile: 'public',
          location: 'connections',
          email: 'private'
        }
      },
      isLoading: true,
      error: null,
      updatePrivacySettings: vi.fn(),
      updateVisibilitySettings: vi.fn()
    });

    await act(async () => {
      render(<ProfilePrivacySettings />);
    });
    
    // Verify loading states
    expect(screen.getByTestId('privacy-settings-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
  });

  test('handles update errors gracefully', async () => {
    const mockUpdateVisibilitySettings = vi.fn().mockRejectedValue(
      new Error('Failed to update privacy settings')
    );
    
    vi.mocked(useProfileStore).mockReturnValue({
      profile: {
        id: 'test-id',
        isPublic: true,
        showLocation: true,
        showEmail: false,
        visibility: {
          profile: 'public',
          location: 'connections',
          email: 'private'
        }
      },
      isLoading: false,
      error: 'Failed to update privacy settings',
      updatePrivacySettings: vi.fn(),
      updateVisibilitySettings: mockUpdateVisibilitySettings
    });

    await act(async () => {
      render(<ProfilePrivacySettings />);
    });
    
    // Change setting
    await user.click(screen.getByLabelText(/public profile/i));
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/failed to update privacy settings/i)).toBeInTheDocument();
    });
  });

  test('disables settings when user lacks permission', async () => {
    vi.mocked(usePermission).mockReturnValue({
      hasPermission: false,
      isLoading: false
    });

    await act(async () => {
      render(<ProfilePrivacySettings />);
    });
    
    // Verify all controls are disabled
    expect(screen.getByLabelText(/public profile/i)).toBeDisabled();
    expect(screen.getByLabelText(/show location/i)).toBeDisabled();
    expect(screen.getByLabelText(/show email/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
  });

  test('shows tooltip explaining disabled state', async () => {
    vi.mocked(usePermission).mockReturnValue({
      hasPermission: false,
      isLoading: false
    });

    await act(async () => {
      render(<ProfilePrivacySettings />);
    });
    
    // Hover over disabled control
    await user.hover(screen.getByLabelText(/public profile/i));
    
    // Verify tooltip
    expect(screen.getByText(/you don't have permission to modify privacy settings/i))
      .toBeInTheDocument();
  });
}); 