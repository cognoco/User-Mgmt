import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoleManagementPanel from '../RoleManagementPanel';
import { useRBACStore } from '@/lib/stores/rbac.store';
import { User } from '@/types/user';
import { RoleSchema, UserRoleSchema, Role, Permission } from '@/types/rbac';

vi.mock('@/lib/stores/rbac.store');

const mockUsers: User[] = [
  { id: '1', email: 'admin@example.com', fullName: 'Admin User' } as User,
  { id: '2', email: 'user@example.com', fullName: 'Regular User' } as User,
];

const mockRoles: RoleSchema[] = [
  { id: 'r1', name: Role.ADMIN, description: 'Admin role', permissions: [Permission.READ_USERS, Permission.ASSIGN_ROLES], isSystem: false, createdAt: '', updatedAt: '' },
  { id: 'r2', name: Role.USER, description: 'User role', permissions: [Permission.READ_USERS], isSystem: false, createdAt: '', updatedAt: '' },
];

const mockUserRoles: UserRoleSchema[] = [
  { id: 'ur1', userId: '1', roleId: 'r1', assignedBy: 'system', createdAt: '', expiresAt: undefined },
  { id: 'ur2', userId: '2', roleId: 'r2', assignedBy: 'system', createdAt: '', expiresAt: undefined },
];

describe('RoleManagementPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRBACStore as any).mockReturnValue({
      roles: mockRoles,
      userRoles: mockUserRoles,
      isLoading: false,
      error: null,
      assignRole: vi.fn(),
      removeRole: vi.fn(),
    });
  });

  it('renders the panel and user/role list', () => {
    render(<RoleManagementPanel users={mockUsers} />);
    expect(screen.getByText('User Role Management')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Regular User')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 users
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });

  it('assigns a role to a user', async () => {
    const assignRole = vi.fn();
    (useRBACStore as any).mockReturnValue({
      roles: mockRoles,
      userRoles: mockUserRoles,
      isLoading: false,
      error: null,
      assignRole,
      removeRole: vi.fn(),
    });
    render(<RoleManagementPanel users={mockUsers} />);
    // For user 2, only 'admin' is assignable
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2);
    await userEvent.selectOptions(selects[1], 'r1');
    await waitFor(() => {
      expect(assignRole).toHaveBeenCalledWith('2', 'r1');
    });
  });

  it('removes a role from a user', async () => {
    const removeRole = vi.fn();
    (useRBACStore as any).mockReturnValue({
      roles: mockRoles,
      userRoles: mockUserRoles,
      isLoading: false,
      error: null,
      assignRole: vi.fn(),
      removeRole,
    });
    render(<RoleManagementPanel users={mockUsers} />);
    // Find the remove button for Admin User's 'admin' role
    const removeButtons = screen.getAllByRole('button', { name: /remove role/i });
    expect(removeButtons.length).toBeGreaterThan(0);
    await userEvent.click(removeButtons[0]);
    await waitFor(() => {
      expect(removeRole).toHaveBeenCalledWith('1', 'r1');
    });
  });

  it('displays permissions for each role in the permissions viewer', () => {
    render(<RoleManagementPanel users={mockUsers} />);
    // Expand all details
    const summaries = screen.getAllByRole('button', { name: /admin|user/i });
    summaries.forEach((summary) => fireEvent.click(summary));
    expect(screen.getByText('read:users')).toBeInTheDocument();
    expect(screen.getByText('assign:roles')).toBeInTheDocument();
  });

  it('handles loading, error, and empty states', () => {
    // Loading state
    (useRBACStore as any).mockReturnValue({
      roles: [],
      userRoles: [],
      isLoading: true,
      error: null,
      assignRole: vi.fn(),
      removeRole: vi.fn(),
    });
    render(<RoleManagementPanel users={mockUsers} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Error state
    (useRBACStore as any).mockReturnValue({
      roles: [],
      userRoles: [],
      isLoading: false,
      error: 'Something went wrong',
      assignRole: vi.fn(),
      removeRole: vi.fn(),
    });
    render(<RoleManagementPanel users={mockUsers} />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Empty state
    (useRBACStore as any).mockReturnValue({
      roles: [],
      userRoles: [],
      isLoading: false,
      error: null,
      assignRole: vi.fn(),
      removeRole: vi.fn(),
    });
    render(<RoleManagementPanel users={[]} />);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    expect(screen.getByText(/no roles defined/i)).toBeInTheDocument();
  });
}); 