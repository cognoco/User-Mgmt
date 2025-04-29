import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useRBACStore } from '@/lib/stores/rbac.store';
import { createRBACStoreMock } from '@/tests/mocks/rbac.store.mock';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }))
}));

// Use robust mock for useAuthStore
vi.mock('@/lib/stores/auth.store', async () => {
  const { createMockAuthStore } = await import('@/tests/mocks/auth.store.mock');
  return { useAuthStore: createMockAuthStore() };
});

vi.mock('@/lib/stores/rbac.store');

describe('ProtectedRoute', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  };

  const MockComponent = () => <div>Protected Content</div>;

  let rbacMock: ReturnType<typeof createRBACStoreMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockImplementation(() => mockRouter);
    // Set default state for useAuthStore
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
    // Set default state for useRBACStore
    rbacMock = createRBACStoreMock();
    (useRBACStore as any).mockReturnValue(rbacMock);
  });

  it('should show loading state when authentication is being checked', async () => {
    useAuthStore.setState({ isAuthenticated: false, user: null, isLoading: true });
    rbacMock.isLoading = false;
    await act(async () => {
      render(
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      );
    });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', async () => {
    await act(async () => {
      render(
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      );
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' }, isLoading: false });
    await act(async () => {
      render(
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      );
    });

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should handle custom redirect paths', async () => {
    await act(async () => {
      render(
        <ProtectedRoute redirectPath="/custom/login">
          <MockComponent />
        </ProtectedRoute>
      );
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/custom/login');
    });
  });

  describe('Role-based access control', () => {
    it('should allow access when user has required role', async () => {
      useAuthStore.setState({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' }, isLoading: false });
      rbacMock.hasRole = vi.fn(() => true);
      await act(async () => {
        render(
          <ProtectedRoute requiredRoles={['admin']}>
            <MockComponent />
          </ProtectedRoute>
        );
      });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny access when user lacks required role', async () => {
      useAuthStore.setState({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' }, isLoading: false });
      rbacMock.hasRole = vi.fn(() => false);
      await act(async () => {
        render(
          <ProtectedRoute requiredRoles={['admin']}>
            <MockComponent />
          </ProtectedRoute>
        );
      });

      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle multiple required roles', async () => {
      useAuthStore.setState({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' }, isLoading: false });
      rbacMock.hasRole = vi.fn((role) => role === 'user' || role === 'editor');
      await act(async () => {
        render(
          <ProtectedRoute requiredRoles={['editor', 'user']}>
            <MockComponent />
          </ProtectedRoute>
        );
      });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should handle custom access denied component', async () => {
      useAuthStore.setState({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' }, isLoading: false });
      rbacMock.hasRole = vi.fn(() => false);
      const CustomDenied = () => <div>Custom Access Denied</div>;

      await act(async () => {
        render(
          <ProtectedRoute 
            requiredRoles={['admin']} 
            accessDeniedComponent={<CustomDenied />}
          >
            <MockComponent />
          </ProtectedRoute>
        );
      });

      expect(screen.getByText('Custom Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Permission-based access control', () => {
    it('should allow access when user has required permission', async () => {
      useAuthStore.setState({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' }, isLoading: false });
      rbacMock.hasPermission = vi.fn(() => true);
      await act(async () => {
        render(
          <ProtectedRoute requiredPermissions={['create:post']}>
            <MockComponent />
          </ProtectedRoute>
        );
      });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny access when user lacks required permission', async () => {
      useAuthStore.setState({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' }, isLoading: false });
      rbacMock.hasPermission = vi.fn(() => false);
      await act(async () => {
        render(
          <ProtectedRoute requiredPermissions={['create:post']}>
            <MockComponent />
          </ProtectedRoute>
        );
      });

      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle multiple required permissions', async () => {
      useAuthStore.setState({ isAuthenticated: true, user: { id: '1', email: 'test@example.com' }, isLoading: false });
      rbacMock.hasPermission = vi.fn((permission) => permission === 'read:post' || permission === 'create:post');
      await act(async () => {
        render(
          <ProtectedRoute requiredPermissions={['read:post', 'create:post']}>
            <MockComponent />
          </ProtectedRoute>
        );
      });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
}); 