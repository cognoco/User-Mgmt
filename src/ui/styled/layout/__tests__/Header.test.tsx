import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Header } from '../Header';

let authState: any;
let logoutMock: any;

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
}));

vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => authState,
}));
vi.mock('@/lib/auth/UserManagementProvider', () => ({
  useUserManagement: () => ({ isNative: false, platform: 'web' }),
}));
vi.mock('@/lib/utils/responsive', () => ({
  useIsMobile: () => false,
}));
vi.mock('@/hooks/utils/usePlatformStyles', () => ({
  getPlatformClasses: () => 'header',
}));

describe('Header component', () => {
  beforeEach(() => {
    logoutMock = vi.fn();
    authState = { user: null, isLoading: false, logout: logoutMock };
  });

  it('shows login link when user is not authenticated', () => {
    render(
      <Header />
    );
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  it('calls logout when logout menu item is clicked', async () => {
    authState.user = { id: '1' };
    const user = userEvent.setup();
    render(
      <Header />
    );
    await user.click(screen.getByRole('button', { name: /profile.menu/i }));
    await user.click(screen.getByRole('menuitem', { name: /logout/i }));
    expect(logoutMock).toHaveBeenCalled();
  });
});
