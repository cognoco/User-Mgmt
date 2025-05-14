import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePermission, withPermission } from '@/hooks/usePermission';
import { checkRolePermission } from '@/lib/rbac/roleService';
import { render } from '@testing-library/react';

// Mocks
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/lib/rbac/roleService', () => ({
  checkRolePermission: vi.fn(),
}));

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Setup QueryClient wrapper
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('usePermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('returns loading state when session is loading', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    });

    const { result } = renderHook(
      () => usePermission({ required: 'test.permission' }),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasPermission).toBe(false);
  });

  it('returns false when no session exists', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    const { result } = renderHook(
      () => usePermission({ required: 'test.permission' }),
      { wrapper }
    );

    expect(result.current.hasPermission).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('checks permission when session exists', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user1' }, expires: '2099-01-01T00:00:00.000Z' },
      status: 'authenticated',
      update: vi.fn(),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ role: 'ADMIN' }),
    });

    vi.mocked(checkRolePermission).mockResolvedValueOnce(true);

    const { result } = renderHook(
      () => usePermission({ required: 'test.permission' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.hasPermission).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/user/role');
    expect(checkRolePermission).toHaveBeenCalledWith('ADMIN', 'test.permission');
  });

  it('returns false when role fetch fails', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user1' }, expires: '2099-01-01T00:00:00.000Z' },
      status: 'authenticated',
      update: vi.fn(),
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

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
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user1' }, expires: '2099-01-01T00:00:00.000Z' },
      status: 'authenticated',
      update: vi.fn(),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ role: 'MEMBER' }),
    });

    vi.mocked(checkRolePermission).mockResolvedValueOnce(false);

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
    queryClient.clear();
  });

  it('shows loading state initially', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    });

    const { getByText } = render(<WrappedComponent />, { wrapper });
    expect(getByText('Loading permissions...')).toBeInTheDocument();
  });

  it('renders nothing when permission check fails', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user1' }, expires: '2099-01-01T00:00:00.000Z' },
      status: 'authenticated',
      update: vi.fn(),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ role: 'MEMBER' }),
    });

    vi.mocked(checkRolePermission).mockResolvedValueOnce(false);

    const { container } = render(<WrappedComponent />, { wrapper });
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders component when permission check passes', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user1' }, expires: '2099-01-01T00:00:00.000Z' },
      status: 'authenticated',
      update: vi.fn(),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ role: 'ADMIN' }),
    });

    vi.mocked(checkRolePermission).mockResolvedValueOnce(true);

    const { getByText } = render(<WrappedComponent />, { wrapper });
    await waitFor(() => {
      expect(getByText('Test Component')).toBeInTheDocument();
    });
  });
});
