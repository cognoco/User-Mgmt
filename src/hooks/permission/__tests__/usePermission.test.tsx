import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/auth/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePermission, withPermission } from '@/hooks/permission/usePermissions';
import { checkRolePermission } from '@/lib/rbac/roleService';
import { render } from '@testing-library/react';
import { TestWrapper } from '@/src/tests/utils/testWrapper';
import { setupTestServices } from '@/src/tests/utils/testServiceSetup';

// Mocks
vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/rbac/roleService', () => ({
  checkRolePermission: vi.fn(),
}));

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Setup mock services
const { mockPermissionService } = setupTestServices();

// Setup QueryClient wrapper
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TestWrapper customServices={{ permissionService: mockPermissionService }}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </TestWrapper>
);

describe('usePermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockPermissionService.hasPermission = vi.fn();
    queryClient.clear();
  });

  it('returns loading state when session is loading', () => {
vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    } as any);

    const { result } = renderHook(
      () => usePermission({ required: 'test.permission' }),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasPermission).toBe(false);
  });

  it('returns false when no session exists', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    } as any);

    const { result } = renderHook(
      () => usePermission({ required: 'test.permission' }),
      { wrapper }
    );

    expect(result.current.hasPermission).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('checks permission when session exists', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user1' } as any,
      isAuthenticated: true,
      isLoading: false,
    } as any);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ role: 'ADMIN' }),
    });

    vi.mocked(checkRolePermission).mockResolvedValueOnce(true);
    mockPermissionService.hasPermission = vi.fn().mockResolvedValueOnce(true);

    const { result } = renderHook(
      () => usePermission({ required: 'test.permission' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.hasPermission).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns false when role fetch fails', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user1' } as any,
      isAuthenticated: true,
      isLoading: false,
    } as any);

    mockFetch.mockResolvedValueOnce({
      ok: false,
    });
    mockPermissionService.hasPermission = vi.fn().mockResolvedValueOnce(false);

    const { result } = renderHook(
      () => usePermission({ required: 'test.permission' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.hasPermission).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns false when permission check fails', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user1' } as any,
      isAuthenticated: true,
      isLoading: false,
    } as any);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ role: 'MEMBER' }),
    });

    vi.mocked(checkRolePermission).mockResolvedValueOnce(false);
    mockPermissionService.hasPermission = vi.fn().mockResolvedValueOnce(false);

    const { result } = renderHook(
      () => usePermission({ required: 'test.permission' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.hasPermission).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('withPermission HOC', () => {
  const TestComponent = () => <div>Test Component</div>;
  const WrappedComponent = withPermission(TestComponent, 'test.permission');

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockPermissionService.hasPermission = vi.fn();
    queryClient.clear();
  });

  it('shows loading state initially', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    } as any);

    const { getByText } = render(<WrappedComponent />, { wrapper });
    expect(getByText('Loading permissions...')).toBeInTheDocument();
  });

  it('renders nothing when permission check fails', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user1' } as any,
      isAuthenticated: true,
      isLoading: false,
    } as any);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ role: 'MEMBER' }),
    });

    vi.mocked(checkRolePermission).mockResolvedValueOnce(false);
    mockPermissionService.hasPermission = vi.fn().mockResolvedValueOnce(false);

    const { container } = render(<WrappedComponent />, { wrapper });
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders component when permission check passes', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user1' } as any,
      isAuthenticated: true,
      isLoading: false,
    } as any);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ role: 'ADMIN' }),
    });

    vi.mocked(checkRolePermission).mockResolvedValueOnce(true);
    mockPermissionService.hasPermission = vi.fn().mockResolvedValueOnce(true);

    const { getByText } = render(<WrappedComponent />, { wrapper });
    await waitFor(() => {
      expect(getByText('Test Component')).toBeInTheDocument();
    });
  });
});
