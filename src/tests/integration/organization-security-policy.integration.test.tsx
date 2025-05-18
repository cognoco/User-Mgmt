import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@/tests/i18nTestSetup';
import { OrganizationSessionManager } from '@/components/company/OrganizationSessionManager';
import { DEFAULT_SECURITY_POLICY } from '@/types/organizations';
import { validatePasswordWithPolicy } from '@/lib/security/password-validation';
import { supabase } from '@/lib/database/supabase';

// Mock dependencies
vi.mock('@/hooks/useOrganizationSession', () => ({
  useOrganizationPolicies: vi.fn(() => ({
    policies: { ...DEFAULT_SECURITY_POLICY },
    loading: false,
    error: null,
    fetchPolicies: vi.fn(),
    updatePolicies: vi.fn().mockResolvedValue(true)
  })),
  useTerminateUserSessions: vi.fn(() => ({
    terminateUserSessions: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null,
    count: 1
  }))
}));

vi.mock('@/hooks/useOrganizationMembers', () => ({
  useOrganizationMembers: vi.fn(() => ({
    members: [
      { 
        id: 'user1', 
        email: 'user1@example.com', 
        name: 'User One',
        active_sessions: 2
      },
      { 
        id: 'user2', 
        email: 'user2@example.com', 
        name: 'User Two',
        active_sessions: 0
      }
    ],
    loading: false,
    error: null,
    refetch: vi.fn()
  }))
}));

vi.mock('@/hooks/useOrganization', () => ({
  useOrganization: vi.fn(() => ({
    organization: { id: 'org1', name: 'Test Organization' }
  }))
}));

vi.mock('@/lib/database/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { security_settings: { ...DEFAULT_SECURITY_POLICY } },
            error: null
          })
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }))
    }))
  }
}));

describe('Organization Security Policy', () => {
  test('renders organization session manager with policy tabs', async () => {
    render(<OrganizationSessionManager orgId="org1" />);
    
    // Check page title
    expect(screen.getByText('Test Organization Security Settings')).toBeInTheDocument();
    
    // Check tab buttons
    expect(screen.getByText('Session Policies')).toBeInTheDocument();
    expect(screen.getByText('Password Policies')).toBeInTheDocument();
    expect(screen.getByText('MFA Requirements')).toBeInTheDocument();
    expect(screen.getByText('IP Restrictions')).toBeInTheDocument();
    expect(screen.getByText('Sensitive Actions')).toBeInTheDocument();
  });
  
  test('renders session policy tab by default', async () => {
    render(<OrganizationSessionManager orgId="org1" />);
    
    // Check session policy inputs
    expect(screen.getByLabelText('Session Timeout')).toBeInTheDocument();
    expect(screen.getByLabelText('Max Sessions Per User')).toBeInTheDocument();
  });
  
  test('switches to password policy tab', async () => {
    const user = userEvent.setup();
    render(<OrganizationSessionManager orgId="org1" />);
    
    // Click on password policies tab
    await user.click(screen.getByText('Password Policies'));
    
    // Check password policy inputs
    await waitFor(() => {
      expect(screen.getByLabelText('Minimum Password Length')).toBeInTheDocument();
      expect(screen.getByLabelText('Require Uppercase Letter')).toBeInTheDocument();
      expect(screen.getByLabelText('Require Lowercase Letter')).toBeInTheDocument();
      expect(screen.getByLabelText('Require Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Require Symbol')).toBeInTheDocument();
      expect(screen.getByLabelText('Password Expiry Days')).toBeInTheDocument();
      expect(screen.getByLabelText('Password History Count')).toBeInTheDocument();
    });
  });
  
  test('switches to MFA requirements tab', async () => {
    const user = userEvent.setup();
    render(<OrganizationSessionManager orgId="org1" />);
    
    // Click on MFA requirements tab
    await user.click(screen.getByText('MFA Requirements'));
    
    // Check MFA requirement inputs
    await waitFor(() => {
      expect(screen.getByLabelText('Require MFA')).toBeInTheDocument();
      expect(screen.getByLabelText('Allow Authenticator App')).toBeInTheDocument();
      expect(screen.getByLabelText('Allow SMS')).toBeInTheDocument();
      expect(screen.getByLabelText('Allow Email')).toBeInTheDocument();
    });
  });
  
  test('switches to IP restrictions tab', async () => {
    const user = userEvent.setup();
    render(<OrganizationSessionManager orgId="org1" />);
    
    // Click on IP restrictions tab
    await user.click(screen.getByText('IP Restrictions'));
    
    // Check IP restriction inputs
    await waitFor(() => {
      expect(screen.getByLabelText('Enable IP Restrictions')).toBeInTheDocument();
      expect(screen.getByLabelText('Allowed IP Addresses')).toBeInTheDocument();
      expect(screen.getByLabelText('Denied IP Addresses')).toBeInTheDocument();
    });
  });
  
  test('switches to sensitive actions tab', async () => {
    const user = userEvent.setup();
    render(<OrganizationSessionManager orgId="org1" />);
    
    // Click on sensitive actions tab
    await user.click(screen.getByText('Sensitive Actions'));
    
    // Check sensitive action inputs
    await waitFor(() => {
      expect(screen.getByLabelText('Require Reauthentication')).toBeInTheDocument();
      expect(screen.getByLabelText('Reauthentication Timeout')).toBeInTheDocument();
      expect(screen.getByLabelText('New Sensitive Action')).toBeInTheDocument();
    });
  });
  
  test('terminates user sessions', async () => {
    const user = userEvent.setup();
    const { useTerminateUserSessions } = await import('@/hooks/useOrganizationSession');
    const mockTerminate = vi.fn().mockResolvedValue({ success: true });
    
    (useTerminateUserSessions as any).mockReturnValue({
      terminateUserSessions: mockTerminate,
      loading: false,
      error: null,
      count: 1
    });
    
    render(<OrganizationSessionManager orgId="org1" />);
    
    // Check user sessions table
    expect(screen.getByText('Active User Sessions')).toBeInTheDocument();
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    
    // Click terminate sessions button
    await user.click(screen.getByText('Terminate Sessions'));
    
    // Confirm in dialog
    await waitFor(() => {
      expect(screen.getByText('Confirm Session Termination')).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: 'Terminate Sessions' }));
    
    // Verify terminate function was called
    await waitFor(() => {
      expect(mockTerminate).toHaveBeenCalledWith('user1');
    });
  });
  
  test('password validation respects organization policy', () => {
    // Test with default policy
    const defaultPolicy = { ...DEFAULT_SECURITY_POLICY };
    
    // Valid password (meets default requirements)
    let result = validatePasswordWithPolicy('Password123', defaultPolicy);
    expect(result.isValid).toBe(true);
    
    // Invalid password (too short)
    result = validatePasswordWithPolicy('Pass1', defaultPolicy);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
    
    // Invalid password (no uppercase)
    result = validatePasswordWithPolicy('password123', defaultPolicy);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
    
    // Invalid password (no number)
    result = validatePasswordWithPolicy('Password', defaultPolicy);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
    
    // Test with custom policy requiring symbols
    const customPolicy = { 
      ...DEFAULT_SECURITY_POLICY,
      password_min_length: 10,
      password_require_symbol: true
    };
    
    // Valid password with custom policy
    result = validatePasswordWithPolicy('Password1$', customPolicy);
    expect(result.isValid).toBe(false); // Too short for custom policy
    
    // Valid password with custom policy
    result = validatePasswordWithPolicy('Password123$', customPolicy);
    expect(result.isValid).toBe(true);
    
    // Invalid password with custom policy (no symbol)
    result = validatePasswordWithPolicy('Password123', customPolicy);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one special character');
  });
  
  test('updates security policy settings', async () => {
    const user = userEvent.setup();
    const { useOrganizationPolicies } = await import('@/hooks/useOrganizationSession');
    const mockUpdatePolicies = vi.fn().mockResolvedValue(true);
    
    (useOrganizationPolicies as any).mockReturnValue({
      policies: { ...DEFAULT_SECURITY_POLICY },
      loading: false,
      error: null,
      fetchPolicies: vi.fn(),
      updatePolicies: mockUpdatePolicies
    });
    
    render(<OrganizationSessionManager orgId="org1" />);
    
    // Update session timeout
    await user.clear(screen.getByLabelText('Session Timeout'));
    await user.type(screen.getByLabelText('Session Timeout'), '120');
    
    // Update max sessions
    await user.clear(screen.getByLabelText('Max Sessions Per User'));
    await user.type(screen.getByLabelText('Max Sessions Per User'), '3');
    
    // Save changes
    await user.click(screen.getByText('Save Session Policies'));
    
    // Verify update function was called with expected values
    await waitFor(() => {
      expect(mockUpdatePolicies).toHaveBeenCalledWith(
        expect.objectContaining({
          session_timeout_mins: 120,
          max_sessions_per_user: 3
        })
      );
    });
  });
}); 