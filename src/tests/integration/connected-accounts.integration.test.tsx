import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectedAccounts } from '@/components/shared/ConnectedAccounts'; // Corrected import path
import { useConnectedAccountsStore } from '@/lib/stores/connected-accounts.store'; // CORRECT STORE
import { createConnectedAccountsStoreMock } from '@/tests/mocks/connected-accounts.store.mock';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';
import { OAuthProvider } from '@/types/oauth'; // Import OAuthProvider if needed
import { ConnectedAccount } from '@/types/connected-accounts'; // Import ConnectedAccount type
import { IntegrationCallbacks, LayoutOptions } from '@/lib/auth/UserManagementProvider';
import { SubscriptionTier } from '@/types/subscription';
import { UserType } from '@/types/user-type';

// Mock necessary dependencies
vi.mock('@/lib/stores/connected-accounts.store');
vi.mock('@/lib/auth/UserManagementProvider');

const mockDisconnectAccount = vi.fn();
const mockConnectAccount = vi.fn();
const mockFetchConnectedAccounts = vi.fn();
const mockUseConnectedAccountsStore = vi.mocked(useConnectedAccountsStore);
const mockUseUserManagement = vi.mocked(useUserManagement);

// Define default values based on UserManagementProvider defaults
const defaultCallbacks: Required<IntegrationCallbacks> = {
  onUserLogin: () => {},
  onUserLogout: () => {},
  onProfileUpdate: () => {},
  onError: () => {},
};

const defaultLayout: Required<LayoutOptions> = {
  useCustomHeader: false,
  headerComponent: null,
  useCustomFooter: false,
  footerComponent: null,
  useCustomLayout: false,
  layoutComponent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
};

describe('ConnectedAccounts Integration Tests', () => {

  const mockAccounts: ConnectedAccount[] = [
    { id: 'acc-1', userId: 'user-123', provider: OAuthProvider.GOOGLE, providerUserId: 'google-123', email: 'test@google.com', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'acc-2', userId: 'user-123', provider: OAuthProvider.GITHUB, providerUserId: 'github-456', email: 'test@github.com', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for Connected Accounts Store
    mockUseConnectedAccountsStore.mockReturnValue(
      createConnectedAccountsStoreMock({
        accounts: mockAccounts,
        isLoading: false,
        error: null,
        fetchConnectedAccounts: mockFetchConnectedAccounts,
        connectAccount: mockConnectAccount,
        disconnectAccount: mockDisconnectAccount,
      })
    );

     // Default mock for User Management context - Add ALL required properties
     mockUseUserManagement.mockReturnValue({
      config: { // Keep existing config, add others if needed by component under test
        // Add specific config properties used by ConnectedAccounts if any
      },
      callbacks: defaultCallbacks, // Use defined default
      layout: defaultLayout, // Use defined default
      platform: 'web',
      isNative: false,
      ui: {}, // Empty object if no specific components are needed
      api: {}, // Placeholder for API object if needed
      storageKeyPrefix: 'user',
      i18nNamespace: 'userManagement',
      twoFactor: { // Default values based on provider
        enabled: false,
        methods: [],
        required: false,
      },
      subscription: { // Default values based on provider
        enabled: false,
        defaultTier: SubscriptionTier.FREE, // Use enum member
        features: {},
        enableBilling: false,
      },
      corporateUsers: { // Default values based on provider
        enabled: false,
        registrationEnabled: true,
        requireCompanyValidation: false,
        allowUserTypeChange: false,
        companyFieldsRequired: ['name'],
        defaultUserType: UserType.PRIVATE, // Use enum member
      },
      oauth: { // Existing oauth mock
        enabled: true,
        providers: [
          { provider: OAuthProvider.GOOGLE, clientId: 'google-client-id', redirectUri: 'http://localhost/callback/google', enabled: true },
          { provider: OAuthProvider.GITHUB, clientId: 'github-client-id', redirectUri: 'http://localhost/callback/github', enabled: true },
          { provider: OAuthProvider.FACEBOOK, clientId: 'facebook-client-id', redirectUri: 'http://localhost/callback/facebook', enabled: true },
        ],
        autoLink: true,
        allowUnverifiedEmails: false,
        defaultRedirectPath: '/',
      },
    });
  });

  it('should render currently connected accounts', () => {
    // Arrange
    render(<ConnectedAccounts />);

    // Assert
    expect(screen.getByText(/google/i)).toBeInTheDocument();
    expect(screen.getByText(/linked on/i)).toBeInTheDocument(); // Check for date display
    expect(screen.getByText(/github/i)).toBeInTheDocument();
    expect(screen.getByText('test@google.com')).toBeInTheDocument();
    expect(screen.getByText('test@github.com')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /disconnect/i })).toHaveLength(2);
  });

  it('should call disconnectAccount when disconnect button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConnectedAccounts />);
    const disconnectButtons = screen.getAllByRole('button', { name: /disconnect/i });

    // Act
    await user.click(disconnectButtons[0]);

    // Assert
    expect(mockDisconnectAccount).toHaveBeenCalledTimes(1);
    expect(mockDisconnectAccount).toHaveBeenCalledWith(mockAccounts[0].id);
  });

  it('should render buttons for available providers to connect', () => {
    // Arrange
    render(<ConnectedAccounts />);

    // Assert
    // Check that buttons render for providers *not* already connected
    expect(screen.getByRole('button', { name: /connect facebook account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect facebook account/i })).not.toBeDisabled();

    // Check that already connected providers are disabled or not shown differently (here checking disabled)
    expect(screen.getByRole('button', { name: /connect google account/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /connect github account/i })).toBeDisabled();

    expect(screen.getByText(/connect new account/i)).toBeInTheDocument();
  });

  // Add tests for:
  // - Error states when fetching/displaying accounts
  // - Error states during unlinking
  // - Loading states
  // - Empty state (no connected accounts)
  // - Interaction with confirmation dialogs if they exist

}); 