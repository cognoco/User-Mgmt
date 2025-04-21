import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuthStore } from '../../../lib/stores/auth.store';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }))
}));

// Mock auth store
vi.mock('../../stores/auth.store', () => ({
  useAuthStore: vi.fn()
}));

describe('ProtectedRoute', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  };

  const MockComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockImplementation(() => mockRouter);
    (useAuthStore as any).mockImplementation(() => ({
      isAuthenticated: false,
      user: null,
      isLoading: false
    }));
  });

  it('should show loading state when authentication is being checked', () => {
    (useAuthStore as any).mockImplementation(() => ({
      isAuthenticated: false,
      user: null,
      isLoading: true
    }));

    render(
      <ProtectedRoute>
        <MockComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', async () => {
    render(
      <ProtectedRoute>
        <MockComponent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/auth/login?returnUrl=/');
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    (useAuthStore as any).mockImplementation(() => ({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
      isLoading: false
    }));

    render(
      <ProtectedRoute>
        <MockComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('should handle custom redirect paths', async () => {
    render(
      <ProtectedRoute loginRedirect="/custom/login">
        <MockComponent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/custom/login?returnUrl=/');
    });
  });

  describe('Role-based access control', () => {
    it('should allow access when user has required role', () => {
      (useAuthStore as any).mockImplementation(() => ({
        isAuthenticated: true,
        user: { 
          id: '1', 
          email: 'test@example.com',
          roles: ['admin']
        },
        isLoading: false
      }));

      render(
        <ProtectedRoute requiredRoles={['admin']}>
          <MockComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny access when user lacks required role', async () => {
      (useAuthStore as any).mockImplementation(() => ({
        isAuthenticated: true,
        user: { 
          id: '1', 
          email: 'test@example.com',
          roles: ['user']
        },
        isLoading: false
      }));

      render(
        <ProtectedRoute requiredRoles={['admin']}>
          <MockComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle multiple required roles', () => {
      (useAuthStore as any).mockImplementation(() => ({
        isAuthenticated: true,
        user: { 
          id: '1', 
          email: 'test@example.com',
          roles: ['user', 'editor']
        },
        isLoading: false
      }));

      render(
        <ProtectedRoute requiredRoles={['editor', 'user']}>
          <MockComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should handle custom access denied component', () => {
      (useAuthStore as any).mockImplementation(() => ({
        isAuthenticated: true,
        user: { 
          id: '1', 
          email: 'test@example.com',
          roles: ['user']
        },
        isLoading: false
      }));

      const CustomDenied = () => <div>Custom Access Denied</div>;

      render(
        <ProtectedRoute 
          requiredRoles={['admin']} 
          accessDeniedComponent={<CustomDenied />}
        >
          <MockComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Custom Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Permission-based access control', () => {
    it('should allow access when user has required permission', () => {
      (useAuthStore as any).mockImplementation(() => ({
        isAuthenticated: true,
        user: { 
          id: '1', 
          email: 'test@example.com',
          permissions: ['create:post']
        },
        isLoading: false
      }));

      render(
        <ProtectedRoute requiredPermissions={['create:post']}>
          <MockComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny access when user lacks required permission', () => {
      (useAuthStore as any).mockImplementation(() => ({
        isAuthenticated: true,
        user: { 
          id: '1', 
          email: 'test@example.com',
          permissions: ['read:post']
        },
        isLoading: false
      }));

      render(
        <ProtectedRoute requiredPermissions={['create:post']}>
          <MockComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle multiple required permissions', () => {
      (useAuthStore as any).mockImplementation(() => ({
        isAuthenticated: true,
        user: { 
          id: '1', 
          email: 'test@example.com',
          permissions: ['read:post', 'create:post']
        },
        isLoading: false
      }));

      render(
        <ProtectedRoute requiredPermissions={['read:post', 'create:post']}>
          <MockComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
}); 