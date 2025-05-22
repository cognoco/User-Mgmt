import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OAuthButtons } from '@/ui/styled/auth/oauth-buttons';
import { useOAuthStore } from '@/lib/stores/oauth.store';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';
import { OAuthProvider } from '@/types/oauth';
import { createOAuthStoreMock } from '@/tests/mocks/oauth.store.mock';

// Mock the hooks
vi.mock('@/lib/stores/oauth.store');
vi.mock('@/lib/auth/UserManagementProvider');

// Define mock return values
const mockLogin = vi.fn();
const mockClearError = vi.fn();
const mockUseOAuthStore = useOAuthStore as vi.Mock;
const mockUseUserManagement = useUserManagement as vi.Mock;

describe('OAuthButtons Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Default mock implementation for OAuth Store
    mockUseOAuthStore.mockReturnValue(
      createOAuthStoreMock({
        login: mockLogin,
        isLoading: false,
        error: null,
        clearError: mockClearError,
      })
    );

    // Default mock implementation for User Management context
    mockUseUserManagement.mockReturnValue({
      oauth: {
        enabled: true,
        providers: [
          { provider: OAuthProvider.GOOGLE },
          { provider: OAuthProvider.GITHUB },
          // Add other providers used in tests if needed
        ],
      },
      // Add other necessary context values if the component uses them
    });
  });

  it('should render enabled OAuth provider buttons', () => {
    // Arrange
    render(<OAuthButtons />);

    // Assert
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
  });

  it('should call the login function with the correct provider when a button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<OAuthButtons />);
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    const githubButton = screen.getByRole('button', { name: /sign in with github/i });

    // Act
    await user.click(googleButton);
    // Assert
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith(OAuthProvider.GOOGLE);

    // Act
    await user.click(githubButton);
    // Assert
    expect(mockLogin).toHaveBeenCalledTimes(2);
    expect(mockLogin).toHaveBeenCalledWith(OAuthProvider.GITHUB);
  });

  it('should display an error message when there is an error', () => {
    // Arrange
    const errorMessage = 'Invalid credentials';
    mockUseOAuthStore.mockReturnValue(
      createOAuthStoreMock({
        login: mockLogin,
        isLoading: false,
        error: errorMessage,
        clearError: mockClearError,
      })
    );
    render(<OAuthButtons />);

    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    // Arrange
    mockUseOAuthStore.mockReturnValue(
      createOAuthStoreMock({
        login: mockLogin,
        isLoading: true,
        error: null,
        clearError: mockClearError,
      })
    );
    render(<OAuthButtons />);

    // Assert
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    expect(googleButton).toBeDisabled();
    const githubButton = screen.getByRole('button', { name: /sign in with github/i });
    expect(githubButton).toBeDisabled();
  });

  it('should clear error on unmount', () => {
    // Arrange
    const { unmount } = render(<OAuthButtons />);

    // Act
    unmount();

    // Assert
    // The effect cleanup runs after unmount
    // We might need to wait for the effect cleanup if it's asynchronous
    // but in this case, it should be synchronous
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  it('should not render if oauth is disabled in context', () => {
    // Arrange
    mockUseUserManagement.mockReturnValue({
      oauth: {
        enabled: false,
        providers: [{ provider: OAuthProvider.GOOGLE }],
      },
    });
    const { container } = render(<OAuthButtons />);

    // Assert
    expect(container.firstChild).toBeNull(); // Check if the component rendered nothing
  });

  it('should not render if no providers are configured', () => {
    // Arrange
    mockUseUserManagement.mockReturnValue({
      oauth: {
        enabled: true,
        providers: [],
      },
    });
    const { container } = render(<OAuthButtons />);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  // Add tests for different modes (signup, connect) if needed
  // Add tests for different layouts if they affect functionality
  // Add tests for showLabels prop
}); 