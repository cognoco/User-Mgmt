import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionPolicyEnforcer } from '@/ui/styled/session/session-policy-enforcer';
import { useAuth } from '@/hooks/auth/useAuth';
import { api } from '@/lib/api/axios';

// Mock the API module
vi.mock('@/lib/api/axios', () => ({
  api: {
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
  }
}));

// Mock the auth store
vi.mock('@/hooks/auth/use-auth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    logout: vi.fn(),
  })),
}));

// Mock the router
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
  })),
}));

describe('Session Management', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    
    // Setup default auth store mock
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should call enforce policies API on mount', async () => {
    render(<SessionPolicyEnforcer>Test Content</SessionPolicyEnforcer>);

    // Verify component renders content
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    // Verify API call was made on mount
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/session/enforce-policies');
    });
  });

  it('should call enforce policies API periodically', async () => {
    render(<SessionPolicyEnforcer intervalMs={1000}>Test Content</SessionPolicyEnforcer>);

    // First call on mount
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    // Advance time to trigger interval
    vi.advanceTimersByTime(1001);

    // Second call after interval
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(2);
    });

    // Advance time again
    vi.advanceTimersByTime(1001);

    // Third call after another interval
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(3);
    });
  });

  it('should call enforce policies API on user activity', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<SessionPolicyEnforcer>Test Content</SessionPolicyEnforcer>);

    // First call on mount
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    // Reset mock to clearly see the next call
    (api.post as any).mockClear();

    // Simulate user activity
    await user.click(screen.getByText('Test Content'));

    // Verify API was called again due to activity
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/session/enforce-policies');
    });
  });

  it('should logout and redirect if API returns 401', async () => {
    // Mock the logout function
    const logoutMock = vi.fn();
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      logout: logoutMock,
    });

    // Mock API to return 401
    (api.post as any).mockRejectedValueOnce({
      response: { status: 401 }
    });

    render(<SessionPolicyEnforcer>Test Content</SessionPolicyEnforcer>);

    // Wait for the API call and error handling
    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/login?reason=session_expired');
    });
  });

  it('should not call API if not authenticated', async () => {
    // Mock user as not authenticated
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: false,
      logout: vi.fn(),
    });

    render(<SessionPolicyEnforcer>Test Content</SessionPolicyEnforcer>);

    // Wait a bit to ensure the API is not called
    vi.advanceTimersByTime(100);
    
    expect(api.post).not.toHaveBeenCalled();
  });
}); 