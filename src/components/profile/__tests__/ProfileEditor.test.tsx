// File: __tests__/components/ProfileEditor.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { useProfileStore } from '@/lib/stores/profile.store';
import { useConnectedAccountsStore } from '@/lib/stores/connected-accounts.store';
import { OAuthProvider } from '@/types/oauth';

// Mock the profile store
jest.mock('@/lib/stores/profile.store', () => ({
  useProfileStore: jest.fn()
}));
// Mock the connected accounts store
jest.mock('@/lib/stores/connected-accounts.store', () => ({
  useConnectedAccountsStore: jest.fn()
}));

describe('ProfileEditor', () => {
  let user;
  let mockConnectAccount;
  let mockDisconnectAccount;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    mockConnectAccount = jest.fn();
    mockDisconnectAccount = jest.fn();

    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        location: 'Test location',
        website: 'https://example.com',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      error: null,
      fetchProfile: jest.fn(),
      updateProfile: jest.fn().mockResolvedValue({}),
      uploadAvatar: jest.fn().mockResolvedValue({}),
      removeAvatar: jest.fn().mockResolvedValue({}),
      clearError: jest.fn()
    });
    (useConnectedAccountsStore as jest.Mock).mockReturnValue({
      accounts: [
        {
          id: '1',
          userId: 'user-1',
          provider: OAuthProvider.GITHUB,
          providerUserId: 'gh-123',
          email: 'gh@example.com',
          displayName: 'GH User',
          avatarUrl: 'https://example.com/gh-avatar.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      isLoading: false,
      error: null,
      fetchConnectedAccounts: jest.fn(),
      connectAccount: mockConnectAccount,
      disconnectAccount: mockDisconnectAccount,
      clearError: jest.fn(),
    });
  });

  test('renders the profile form correctly', async () => {
    render(<ProfileEditor />);
    
    // Check if the form elements are rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    
    // Check if the avatar section is rendered
    expect(screen.getByAltText(/profile avatar/i)).toBeInTheDocument();
    expect(screen.getByText(/change avatar/i)).toBeInTheDocument();
  });

  test('submits the form with correct data', async () => {
    const mockUpdateProfile = jest.fn().mockResolvedValue({});
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        location: 'Test location',
        website: 'https://example.com',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      error: null,
      updateProfile: mockUpdateProfile,
      uploadAvatar: jest.fn(),
      removeAvatar: jest.fn(),
      clearError: jest.fn()
    });

    render(<ProfileEditor />);
    
    // Fill form data
    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), 'New Name');
    
    await user.clear(screen.getByLabelText(/bio/i));
    await user.type(screen.getByLabelText(/bio/i), 'Updated bio');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /save profile/i }));
    
    // Check if updateProfile was called with correct data
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Name',
          email: 'test@example.com',
          bio: 'Updated bio',
        })
      );
    });
  });

  test('shows loading state during form submission', async () => {
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com'
      },
      isLoading: true,
      error: null,
      updateProfile: jest.fn(),
      uploadAvatar: jest.fn(),
      removeAvatar: jest.fn(),
      clearError: jest.fn()
    });

    render(<ProfileEditor />);
    
    // Check if the submit button is disabled
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  test('handles profile update error', async () => {
    const mockUpdateProfile = jest.fn().mockRejectedValue(new Error('Failed to update profile'));
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
      },
      isLoading: false,
      error: 'Failed to update profile',
      updateProfile: mockUpdateProfile,
      uploadAvatar: jest.fn(),
      removeAvatar: jest.fn(),
      clearError: jest.fn()
    });

    render(<ProfileEditor />);
    
    // Check if error message is displayed
    expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
  });

  test('handles avatar upload', async () => {
    const mockUploadAvatar = jest.fn().mockResolvedValue({
      avatarUrl: 'https://example.com/new-avatar.jpg'
    });
    
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      uploadAvatar: mockUploadAvatar,
      removeAvatar: jest.fn(),
      clearError: jest.fn()
    });

    render(<ProfileEditor />);
    
    // Create a mock file
    const file = new File(['test'], 'new-avatar.jpg', { type: 'image/jpeg' });
    
    // Find file input and upload file
    const fileInput = screen.getByLabelText(/upload new avatar/i);
    await user.upload(fileInput, file);
    
    // Check if uploadAvatar was called with the file
    await waitFor(() => {
      expect(mockUploadAvatar).toHaveBeenCalledWith(file);
    });
  });

  test('handles avatar removal', async () => {
    const mockRemoveAvatar = jest.fn().mockResolvedValue({});
    
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      uploadAvatar: jest.fn(),
      removeAvatar: mockRemoveAvatar,
      clearError: jest.fn()
    });

    render(<ProfileEditor />);
    
    // Click remove avatar button
    await user.click(screen.getByRole('button', { name: /remove avatar/i }));
    
    // Check if removeAvatar was called
    await waitFor(() => {
      expect(mockRemoveAvatar).toHaveBeenCalled();
    });
  });

  test('renders Connected Accounts section in the profile editor', () => {
    render(<ProfileEditor />);
    // Check for the heading
    expect(screen.getByText(/connected accounts/i)).toBeInTheDocument();
    // Check for at least one provider button (e.g., Google, GitHub, etc.)
    // This will depend on the ConnectedAccounts store mock, but we can check for a button
    // with a provider label (e.g., Google, GitHub, etc.)
    // For now, just check for the section container
    expect(screen.getByRole('heading', { name: /connected accounts/i })).toBeInTheDocument();
    // Optionally, check for a button (if the ConnectedAccounts mock is set up)
    // expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
  });

  test('renders provider buttons and connected accounts', () => {
    render(<ProfileEditor />);
    // Google button should be present (not connected)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    // GitHub button should be present and disabled (already connected)
    const githubButton = screen.getByRole('button', { name: /github/i });
    expect(githubButton).toBeInTheDocument();
    expect(githubButton).toBeDisabled();
  });

  test('links a new account when provider button is clicked', async () => {
    render(<ProfileEditor />);
    const googleButton = screen.getByRole('button', { name: /google/i });
    await user.click(googleButton);
    expect(mockConnectAccount).toHaveBeenCalledWith(OAuthProvider.GOOGLE);
  });

  test('unlinks an account when disconnect button is clicked', async () => {
    render(<ProfileEditor />);
    // Find the disconnect button for GitHub (Trash icon, aria-label not set, so use role/button order)
    const disconnectButtons = screen.getAllByRole('button', { name: '' });
    // The first disconnect button should be for GitHub
    await user.click(disconnectButtons[0]);
    expect(mockDisconnectAccount).toHaveBeenCalledWith('1');
  });
});
