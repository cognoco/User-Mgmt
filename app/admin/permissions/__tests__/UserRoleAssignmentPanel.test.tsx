// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserRoleAssignmentPanel from '@app/admin/permissions/UserRoleAssignmentPanel';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { usePermission } from '@/hooks/permission/usePermissions';

vi.mock('@/hooks/admin/useAdminUsers');
vi.mock('@/hooks/permission/usePermissions');

describe('UserRoleAssignmentPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while permission check in progress', () => {
    vi.mocked(usePermission).mockReturnValue({ hasPermission: false, isLoading: true } as any);
    vi.mocked(useAdminUsers).mockReturnValue({ users: [], searchUsers: vi.fn() } as any);
    render(<UserRoleAssignmentPanel />);
    expect(screen.getByText(/loading permissions/i)).toBeInTheDocument();
  });

  it('renders nothing when permission denied', () => {
    vi.mocked(usePermission).mockReturnValue({ hasPermission: false, isLoading: false } as any);
    vi.mocked(useAdminUsers).mockReturnValue({ users: [], searchUsers: vi.fn() } as any);
    const { container } = render(<UserRoleAssignmentPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders role management panel when permission granted', () => {
    const searchUsers = vi.fn();
    vi.mocked(usePermission).mockReturnValue({ hasPermission: true, isLoading: false } as any);
    vi.mocked(useAdminUsers).mockReturnValue({ users: [{ id: '1', email: 'test' }], searchUsers } as any);
    render(<UserRoleAssignmentPanel />);
    expect(screen.getByText('User Role Management')).toBeInTheDocument();
    expect(searchUsers).toHaveBeenCalled();
  });
});
