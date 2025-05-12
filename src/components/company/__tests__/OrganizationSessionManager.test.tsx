import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { OrganizationSessionManager } from '../OrganizationSessionManager';
import { OrganizationProvider } from '@/lib/context/OrganizationContext';
import { UserManagementProvider } from '@/lib/auth/UserManagementProvider';
import { vi, describe, beforeEach, test, expect } from 'vitest';

vi.mock('@/lib/database/supabase', async () => (await import('@/tests/mocks/supabase')));
import { supabase } from '@/lib/database/supabase';

describe('Business-specific Session Controls', () => {
  let user: UserEvent;
  const mockAdminUser = {
    id: 'admin-123',
    email: 'admin@example.com',
    role: 'authenticated',
    app_metadata: { role: 'admin' }
  };
  const mockOrganization = {
    id: 'org-123',
    name: 'Acme Inc',
    domain: 'acme.com',
    security_settings: {
      session_timeout_mins: 60,
      max_sessions_per_user: 3,
      enforce_ip_restrictions: true,
      allowed_ip_ranges: ['192.168.1.0/24', '10.0.0.0/16'],
      enforce_device_restrictions: true,
      allowed_device_types: ['desktop', 'mobile'],
      require_reauth_for_sensitive: true,
      sensitive_actions: ['payment', 'user_management', 'api_keys']
    }
  };
  const mockOrgMembers = [
    {
      user_id: 'user-123',
      email: 'user@example.com',
      role: 'member',
      active_sessions: 2,
      last_active: '2023-06-15T14:30:00Z'
    },
    {
      user_id: 'user-456',
      email: 'manager@example.com',
      role: 'manager',
      active_sessions: 1,
      last_active: '2023-06-14T16:45:00Z'
    },
    {
      user_id: 'admin-123',
      email: 'admin@example.com',
      role: 'admin',
      active_sessions: 1,
      last_active: '2023-06-15T09:15:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    (supabase.auth.getUser as vi.Mock).mockResolvedValue({
      data: { user: mockAdminUser },
      error: null
    });
  });

  test('Admin can view and configure organization session policies', async () => {
    (supabase.from as vi.Mock).mockReturnValue({
        update: vi.fn().mockImplementation((data) => ({
            eq: vi.fn().mockResolvedValue({
                data: { ...mockOrganization, security_settings: { ...mockOrganization.security_settings, ...data } },
                error: null
            })
        }))
    });
    render(
      <UserManagementProvider>
        <OrganizationProvider orgId="org-123">
          <OrganizationSessionManager orgId="org-123" />
        </OrganizationProvider>
      </UserManagementProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/acme inc/i)).toBeInTheDocument();
      expect(screen.getByText(/session policies/i)).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    const timeoutInput = screen.getByLabelText(/session timeout/i);
    await act(async () => {
        await user.clear(timeoutInput);
        await user.type(timeoutInput, '30');
    });
    await act(async () => {
        await user.click(screen.getByRole('button', { name: /save/i }));
    });
    await waitFor(() => {
      expect((supabase.from as vi.Mock)('organizations').update).toHaveBeenCalledWith(
        expect.objectContaining({
          session_timeout_mins: 30
        })
      );
    });
    expect(screen.getByText(/settings updated/i)).toBeInTheDocument();
  });

  test('Admin can view and terminate user sessions across organization', async () => {
    (supabase.rpc as vi.Mock).mockImplementation((procedure, params) => {
      if (procedure === 'terminate_user_sessions') {
        return Promise.resolve({
          data: { count: params.user_id === 'user-123' ? 2 : 1 },
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    });
    render(
      <UserManagementProvider>
        <OrganizationProvider orgId="org-123">
          <OrganizationSessionManager orgId="org-123" />
        </OrganizationProvider>
      </UserManagementProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/organization members/i)).toBeInTheDocument();
      expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/manager@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/2 active sessions/i)).toBeInTheDocument();
    });
    const terminateButtons = screen.getAllByRole('button', { name: /terminate sessions/i });
    await act(async () => {
        await user.click(terminateButtons[0]);
    });
    await act(async () => {
        await user.click(screen.getByRole('button', { name: /confirm/i }));
    });
    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('terminate_user_sessions', {
        user_id: 'user-123'
      });
    });
    expect(screen.getByText(/2 sessions terminated/i)).toBeInTheDocument();
  });

  test('Admin can configure IP restrictions', async () => {
    (supabase.from as vi.Mock).mockReturnValue({
        update: vi.fn().mockImplementation((data) => ({
            eq: vi.fn().mockResolvedValue({
                data: { ...mockOrganization, security_settings: { ...mockOrganization.security_settings, ...data } },
                error: null
            })
        }))
    });
    render(
      <UserManagementProvider>
        <OrganizationProvider orgId="org-123">
          <OrganizationSessionManager orgId="org-123" />
        </OrganizationProvider>
      </UserManagementProvider>
    );
    await act(async () => {
        await user.click(screen.getByRole('tab', { name: /ip restrictions/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/allowed ip ranges/i)).toBeInTheDocument();
      expect(screen.getByText(/192.168.1.0\/24/i)).toBeInTheDocument();
    });
    await act(async () => {
        await user.click(screen.getByLabelText(/enforce ip restrictions/i));
    });
    await act(async () => {
        await user.click(screen.getByRole('button', { name: /add ip range/i }));
    });
    await act(async () => {
        await user.type(screen.getByPlaceholderText(/enter ip range/i), '172.16.0.0/16');
    });
    await act(async () => {
        await user.click(screen.getByRole('button', { name: /add/i }));
    });
    await act(async () => {
        await user.click(screen.getByRole('button', { name: /save/i }));
    });
    await waitFor(() => {
      expect((supabase.from as vi.Mock)('organizations').update).toHaveBeenCalledWith(
        expect.objectContaining({
          enforce_ip_restrictions: false,
          allowed_ip_ranges: ['192.168.1.0/24', '10.0.0.0/16', '172.16.0.0/16']
        })
      );
    });
    expect(screen.getByText(/settings updated/i)).toBeInTheDocument();
  });

  test('Admin can configure reauthentication for sensitive actions', async () => {
    render(
      <UserManagementProvider>
        <OrganizationProvider orgId="org-123">
          <OrganizationSessionManager orgId="org-123" />
        </OrganizationProvider>
      </UserManagementProvider>
    );
    await user.click(screen.getByRole('tab', { name: /sensitive actions/i }));
    await waitFor(() => {
      expect(screen.getByText(/require reauthentication/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/payment/i)).toBeChecked();
      expect(screen.getByLabelText(/user management/i)).toBeChecked();
      expect(screen.getByLabelText(/api keys/i)).toBeChecked();
    });
    await user.click(screen.getByRole('button', { name: /add custom action/i }));
    await user.type(screen.getByPlaceholderText(/action name/i), 'delete_records');
    await user.click(screen.getByRole('button', { name: /add/i }));
    await user.click(screen.getByLabelText(/payment/i));
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(supabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          sensitive_actions: ['user_management', 'api_keys', 'delete_records']
        })
      );
    });
  });

  test('IP restriction enforcement is applied during login', async () => {
    const mockIp = '192.168.1.100';
    supabase.rpc.mockImplementation((procedure, params) => {
      if (procedure === 'check_ip_restrictions') {
        const allowed = mockOrganization.security_settings.allowed_ip_ranges.some(range => {
          if (range === '192.168.1.0/24') {
            return mockIp.startsWith('192.168.1.');
          }
          return false;
        });
        return Promise.resolve({
          data: { allowed },
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    });
    render(
      <OrganizationProvider orgId="org-123">
        <OrganizationSessionManager orgId="org-123" />
      </OrganizationProvider>
    );
    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('check_ip_restrictions', {
        org_id: 'org-123',
        ip_address: mockIp
      });
    });
    expect(screen.getByText(/ip verification successful/i)).toBeInTheDocument();
    vi.clearAllMocks();
    const unauthorizedIp = '203.0.113.1';
    supabase.rpc.mockImplementation((procedure, params) => {
      if (procedure === 'check_ip_restrictions') {
        return Promise.resolve({
          data: { allowed: false },
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    });
    render(
      <OrganizationProvider orgId="org-123">
        <OrganizationSessionManager orgId="org-123" />
      </OrganizationProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/unauthorized ip address/i)).toBeInTheDocument();
    });
  });

  test('Force reauthentication dialog works correctly for sensitive operations', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: mockAdminUser, session: { access_token: 'new-token' } },
      error: null
    });
    render(
      <UserManagementProvider>
        <OrganizationProvider orgId="org-123">
          <OrganizationSessionManager orgId="org-123" />
        </OrganizationProvider>
      </UserManagementProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/this action requires reauthentication/i)).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /verify/i }));
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'password123'
      });
    });
    expect(screen.getByText(/verification successful/i)).toBeInTheDocument();
  });
}); 