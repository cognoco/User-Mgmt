/**
 * Example test file demonstrating proper testing of components that use the auth store
 * This shows how to avoid the "function is not a function" error in component tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { userEvent } from '@testing-library/user-event';

// Create a simple test component that uses the auth store
const AuthTestComponent = () => {
  const { user, isLoading, error, login, logout } = useAuthStore();

  const handleLogin = async () => {
    await login({ email: 'test@example.com', password: 'password123' });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      {user ? (
        <>
          <div data-testid="user-email">{user.email}</div>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      )}
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  );
};

// Define the Helper function at the top level scope
const createAuthStoreMock = (overrides = {}) => {
  const defaultMock = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    successMessage: null,
    login: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue({ success: true }),
    resetPassword: vi.fn().mockResolvedValue({ success: true }),
    updatePassword: vi.fn().mockResolvedValue(undefined),
    sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
    verifyEmail: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
    clearSuccessMessage: vi.fn(),
    deleteAccount: vi.fn().mockResolvedValue(undefined),
  };
  return { ...defaultMock, ...overrides };
};

// APPROACH 1: Mock the entire store
describe('AuthTestComponent with full store mock', () => {
  // Define mock functions needed locally for assertions
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset().mockResolvedValue({ success: true });
    mockLogout.mockReset().mockResolvedValue(undefined);

    // Mock the store IMPLEMENTATION EXPLICITLY for this block
    vi.mock('@/lib/stores/auth.store', () => ({
      useAuthStore: vi.fn(() => ({ // Return the explicit mock object
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        successMessage: null,
        login: mockLogin,  // Use the locally defined mockLogin
        logout: mockLogout, // Use the locally defined mockLogout
        // Include all other functions as vi.fn()
        register: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        sendVerificationEmail: vi.fn(),
        verifyEmail: vi.fn(),
        clearError: vi.fn(),
        clearSuccessMessage: vi.fn(),
        deleteAccount: vi.fn(),
      }))
    }));
  });

  it('should render login button when user is not logged in', () => {
    // Override the mock state for this specific test if needed
    (useAuthStore as any).mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        successMessage: null,
        login: mockLogin,
        logout: mockLogout,
        register: vi.fn(), resetPassword: vi.fn(), updatePassword: vi.fn(), sendVerificationEmail: vi.fn(), verifyEmail: vi.fn(), clearError: vi.fn(), clearSuccessMessage: vi.fn(), deleteAccount: vi.fn(),
    });
    render(<AuthTestComponent />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should call login function when login button is clicked', async () => {
    const user = userEvent.setup();
    // Use default mock state from beforeEach
    render(<AuthTestComponent />);
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).not.toBeDisabled();
    await user.click(loginButton);
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('should show user email when logged in', () => {
    // Override the mock state for this specific test case
    (useAuthStore as any).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      successMessage: null,
      login: mockLogin,
      logout: mockLogout,
      register: vi.fn(), resetPassword: vi.fn(), updatePassword: vi.fn(), sendVerificationEmail: vi.fn(), verifyEmail: vi.fn(), clearError: vi.fn(), clearSuccessMessage: vi.fn(), deleteAccount: vi.fn(),
    });
    render(<AuthTestComponent />);
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });
});

// APPROACH 2: Use a helper function to create consistent mocks
describe('AuthTestComponent with helper function', () => {
  // Helper function is defined above
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mock('@/lib/stores/auth.store', () => ({
      useAuthStore: vi.fn(() => createAuthStoreMock())
    }));
  });

  // ... tests for Approach 2 ...
});

// Note: These tests are for demonstration purposes only.
// In a real application, you would need to unmock the store after your tests.
// vi.unmock('@/lib/stores/auth.store'); 