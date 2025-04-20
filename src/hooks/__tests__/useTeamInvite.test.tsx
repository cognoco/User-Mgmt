import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTeamInvite } from '../useTeamInvite';
import { toast } from 'sonner';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Test wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useTeamInvite', () => {
  const inviteData = {
    email: 'test@example.com',
    role: 'member' as const,
    teamLicenseId: 'license-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send an invitation successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useTeamInvite(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(inviteData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/team/invites/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inviteData),
    });

    expect(toast.success).toHaveBeenCalledWith('Invitation sent successfully');
  });

  it('should handle invitation failure', async () => {
    const errorMessage = 'Invalid email address';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage }),
    });

    const { result } = renderHook(() => useTeamInvite(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(inviteData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTeamInvite(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(inviteData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith('Network error');
  });
});
