import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectedAccounts } from '@/components/shared/ConnectedAccounts'; // Corrected import path
import { useAuthStore } from '@/lib/stores/auth.store'; // Assuming auth store holds connected accounts info
import { useUserManagement } from '@/lib/auth/UserManagementProvider';

// Mock necessary dependencies
vi.mock('@/lib/stores/auth.store');
vi.mock('@/lib/auth/UserManagementProvider');

const mockUnlinkProvider = vi.fn();
const mockUseAuthStore = useAuthStore as vi.Mock;
const mockUseUserManagement = useUserManagement as vi.Mock;

describe('ConnectedAccounts Integration Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for Auth Store (adjust based on actual store structure)
    mockUseAuthStore.mockReturnValue({
      user: {
        id: 'user-123',
        // ... other user props
        connectedAccounts: [
          { provider: 'google', providerAccountId: 'google-123', linkedAt: new Date().toISOString() },
          { provider: 'github', providerAccountId: 'github-456', linkedAt: new Date().toISOString() },
        ],
      },
      unlinkProvider: mockUnlinkProvider,
      isLoading: false,
      error: null,
      // ... other store state/actions used by the component
    });

     // Default mock for User Management context
     mockUseUserManagement.mockReturnValue({
        oauth: {
          enabled: true,
          // Define providers available for *connecting*
          providers: [
            { provider: 'google' },
            { provider: 'github' },
            { provider: 'facebook' }, // Example: Facebook available to connect
          ],
        },
        // Add other necessary context values if the component uses them
      });
  });

  it('should render currently connected accounts', () => {
    // Arrange
    render(<ConnectedAccounts />);

    // Assert
    expect(screen.getByText(/google/i)).toBeInTheDocument();
    expect(screen.getByText(/linked on/i)).toBeInTheDocument(); // Check for date display
    expect(screen.getByText(/github/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /unlink/i })).toHaveLength(2);
  });

  it('should call unlinkProvider when unlink button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConnectedAccounts />);
    const unlinkButtons = screen.getAllByRole('button', { name: /unlink/i });

    // Act
    await user.click(unlinkButtons[0]); // Click unlink for the first provider (e.g., Google)

    // Assert
    // Add specific confirmation dialog interaction if one exists
    expect(mockUnlinkProvider).toHaveBeenCalledTimes(1);
    expect(mockUnlinkProvider).toHaveBeenCalledWith('google'); // Verify correct provider
  });

  it('should render OAuthButtons for available providers to connect', () => {
    // Arrange
    render(<ConnectedAccounts />);

    // Assert
    // Check that OAuthButtons renders buttons for providers *not* already connected
    // This might require inspecting the props passed to a mocked OAuthButtons or checking rendered output
    // For now, just check if the section title exists
    expect(screen.getByText(/add connection/i)).toBeInTheDocument();
    // A more robust test would mock OAuthButtons and check its props, or verify specific buttons appear
  });

  // Add tests for:
  // - Error states when fetching/displaying accounts
  // - Error states during unlinking
  // - Loading states
  // - Empty state (no connected accounts)
  // - Interaction with confirmation dialogs if they exist

}); 