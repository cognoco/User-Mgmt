// __tests__/integration/admin-users-flow.test.js

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminUsers } from '@/ui/styled/admin/AdminUsers';
import { describe, expect, beforeEach, vi } from 'vitest';
import { UserType } from '@/types/user-type';

// Mock user list to return from API
const mockUsersList = [
  { id: 'user1', email: 'user1@example.com', role: 'user', created_at: '2023-01-01', isActive: true, isVerified: false, userType: UserType.PRIVATE, username: '', firstName: '', lastName: '', fullName: '', company: undefined, createdAt: '', updatedAt: '', lastLogin: '', metadata: {} },
  { id: 'user2', email: 'user2@example.com', role: 'user', created_at: '2023-01-02', isActive: true, isVerified: false, userType: UserType.PRIVATE, username: '', firstName: '', lastName: '', fullName: '', company: undefined, createdAt: '', updatedAt: '', lastLogin: '', metadata: {} },
  { id: 'admin1', email: 'admin@example.com', role: 'admin', created_at: '2023-01-03', isActive: true, isVerified: true, userType: UserType.PRIVATE, username: '', firstName: '', lastName: '', fullName: '', company: undefined, createdAt: '', updatedAt: '', lastLogin: '', metadata: {} }
];

let fetchUsersMock: () => Promise<typeof mockUsersList>;
let handleRoleChangeMock: (user: any, newRole: string) => Promise<any>;

// Mock the AdminUsers component's dependencies
vi.mock('@/ui/styled/admin/AdminUsers', async (importOriginal: () => Promise<any>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    AdminUsers: (props: any) => {
      // Use the real component but inject mocked fetchUsers and handleRoleChange
      return <actual.AdminUsers {...props} fetchUsers={fetchUsersMock} handleRoleChange={handleRoleChangeMock} />;
    },
  };
});

describe('Admin Users Management Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    fetchUsersMock = vi.fn().mockResolvedValue(mockUsersList);
    handleRoleChangeMock = vi.fn().mockResolvedValue({ ...mockUsersList[0], role: 'admin' });
  });

  test('Admin can view and manage users', async () => {
    // Render the admin component
    render(<AdminUsers />);
    
    // Wait for the user list to load
    await screen.findByText('user1@example.com');
    await screen.findByText('user2@example.com');
    await screen.findByText('admin@example.com');

    // Test filtering users
    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'admin');
    
    // Verify the filtering worked
    await waitFor(() => {
      expect(screen.queryByText('user1@example.com')).not.toBeInTheDocument();
      expect(screen.queryByText('user2@example.com')).not.toBeInTheDocument();
      await screen.findByText('admin@example.com');
    });
    
    // Clear the filter
    await user.clear(searchInput);
    
    // All users should be visible again
    await screen.findByText('user1@example.com');
    await screen.findByText('user2@example.com');
    await screen.findByText('admin@example.com');

    // Test user role management
    // Find the row for user1@example.com
    const userRow = await screen.findByText('user1@example.com');
    const row = userRow.closest('tr');

    // Find the select within that row
    const select = within(row!).getByRole('combobox');

    // Change the value to "admin"
    await user.selectOptions(select, 'admin');

    // Verify the update API was called
    await waitFor(() => {
      expect(handleRoleChangeMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'user1' }), 'admin');
    });
  });

  test('Admin can handle user management errors', async () => {
    // Mock error when fetching users
    fetchUsersMock = vi.fn().mockImplementation(() => {
      // Simulate error by returning a rejected promise
      return Promise.reject(new Error('Failed to fetch users'));
    });

    // Render the admin component
    render(<AdminUsers fetchUsers={fetchUsersMock} handleRoleChange={handleRoleChangeMock} />);

    // Check if error message is displayed
    await screen.findByText(/failed to fetch users/i);

    // Retry button should be present
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Mock successful fetch for retry
    fetchUsersMock = vi.fn().mockResolvedValue(mockUsersList);

    // Click retry
    await user.click(retryButton);

    // Check if users are now displayed
    await screen.findByText('user1@example.com');
    await screen.findByText('user2@example.com');
    await screen.findByText('admin@example.com');
  });
});
