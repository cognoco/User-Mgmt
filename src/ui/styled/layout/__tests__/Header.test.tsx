import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@/tests/testUtils';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '@/ui/styled/layout/Header';

let authState: any;
let logoutMock: any;

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
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  it('calls logout when logout menu item is clicked', async () => {
    authState.user = { id: '1' };
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: /profile.menu/i }));
    await user.click(screen.getByRole('menuitem', { name: /logout/i }));
    expect(logoutMock).toHaveBeenCalled();
  });
});
