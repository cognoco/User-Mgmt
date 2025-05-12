// __tests__/integration/account-switching-flow.test.js

vi.mock('@/lib/database/supabase', () => require('@/tests/mocks/supabase'));

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountSwitcher } from '@/components/account/AccountSwitcher';

// Import our standardized mock
import { supabase } from '@/lib/database/supabase';

describe('Account Switching Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  // Mock accounts data
  const mockAccounts = [
    { id: 'personal', name: 'Personal Account', type: 'personal', avatar_url: 'https://example.com/avatar1.jpg' },
    { id: 'work', name: 'Work Account', type: 'organization', avatar_url: 'https://example.com/avatar2.jpg' },
    { id: 'client', name: 'Client Project', type: 'organization', avatar_url: 'https://example.com/avatar3.jpg' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    
    // Mock current user and session
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { 
        user: { 
          id: 'user-123', 
          email: 'user@example.com',
          user_metadata: { current_account: 'personal' }
        }
      },
      error: null
    });
    
    // Mock available accounts
    const accountsBuilder = supabase.from('accounts') as any;
    accountsBuilder.select.mockResolvedValueOnce('*', {
      data: mockAccounts,
      error: null
    });
  });

  test('User can view and switch between accounts', async () => {
    // Render account switcher
    render(<AccountSwitcher />);
    // Wait for loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading accounts/i)).not.toBeInTheDocument();
    });
    // Wait for accounts to load
    await waitFor(() => {
      expect(screen.getByText('Personal Account')).toBeInTheDocument();
      expect(screen.getByText('Work Account')).toBeInTheDocument();
      expect(screen.getByText('Client Project')).toBeInTheDocument();
    });
    // Verify current account is indicated
    expect(screen.getByText('Personal Account').closest('li')).toHaveClass('active-account');
    // Mock successful account switch
    supabase.rpc = vi.fn().mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    // Switch to work account
    await user.click(screen.getByText('Work Account'));
    // Verify RPC call was made with correct parameters
    expect(supabase.rpc).toHaveBeenCalledWith('switch_account', {
      account_id: 'work'
    });
    // Verify spinner during switch
    expect(screen.getByText('🔄')).toBeInTheDocument();
    // Mock page reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        reload: mockReload
      },
      writable: true
    });
    // Verify page reload was triggered after successful switch
    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled();
    });
  });
  
  test('User can create a new organization account', async () => {
    // Render account switcher
    render(<AccountSwitcher />);
    // Wait for loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading accounts/i)).not.toBeInTheDocument();
    });
    // Wait for accounts to load
    await waitFor(() => {
      expect(screen.getByText('Personal Account')).toBeInTheDocument();
    });
    // Click create new organization button
    await user.click(screen.getByRole('button', { name: /create organization/i }));
    // Fill organization details
    await user.type(screen.getByLabelText(/organization name/i), 'New Organization');
    // Mock successful creation
    const accountsBuilder = supabase.from('accounts') as any;
    accountsBuilder.insert.mockResolvedValueOnce({
      data: { 
        id: 'new-org', 
        name: 'New Organization', 
        type: 'organization',
        avatar_url: null
      },
      error: null
    });
    // Submit form
    await user.click(screen.getByRole('button', { name: /create/i }));
    // Verify insert was called with correct data
    expect(accountsBuilder.insert).toHaveBeenCalledWith({
      name: 'New Organization',
      type: 'organization',
      owner_id: 'user-123'
    });
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/organization created/i)).toBeInTheDocument();
    });
    // Mock automatic switch to new account
    supabase.rpc = vi.fn().mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    // Verify RPC call to switch account
    expect(supabase.rpc).toHaveBeenCalledWith('switch_account', {
      account_id: 'new-org'
    });
  });
  
  test('Displays account-specific information', async () => {
    // Mock organization members
    const mockMembers = [
      { id: 'user-123', name: 'Current User', role: 'owner' },
      { id: 'user-456', name: 'Team Member', role: 'member' }
    ];
    
    // Mock members query
    const orgMembersBuilder = supabase.from('organization_members') as any;
    orgMembersBuilder.select.mockImplementation((query: string) => {
      if (query && query.includes('members')) {
        return Promise.resolve({
          data: mockMembers,
          error: null
        });
      }
      return Promise.resolve({
        data: mockAccounts,
        error: null
      });
    });
    
    // Render account switcher
    render(<AccountSwitcher showDetails={true} />);
    
    // Wait for accounts to load
    await waitFor(() => {
      expect(screen.getByText('Personal Account')).toBeInTheDocument();
    });
    
    // Switch to work account to view details
    await user.click(screen.getByText('Work Account'));
    
    // Wait for account details to load
    await waitFor(() => {
      expect(screen.getByText(/account details/i)).toBeInTheDocument();
    });
    
    // Verify members are displayed
    expect(screen.getByText('Current User')).toBeInTheDocument();
    expect(screen.getByText('Team Member')).toBeInTheDocument();
    
    // Verify roles are displayed
    expect(screen.getByText('owner')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument();
  });
  
// Continuing the account-switching-flow.test.js file

  test('User can leave an organization account', async () => {
    // Render account switcher
    render(<AccountSwitcher showDetails={true} />);
    
    // Wait for accounts to load
    await waitFor(() => {
      expect(screen.getByText('Work Account')).toBeInTheDocument();
    });
    
    // Switch to work account
    await user.click(screen.getByText('Work Account'));
    
    // Click account settings button
    await user.click(screen.getByRole('button', { name: /account settings/i }));
    
    // Click leave organization button
    await user.click(screen.getByRole('button', { name: /leave organization/i }));
    
    // Confirm leave dialog
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Mock successful leave operation
    supabase.rpc = vi.fn().mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    
    // Verify RPC call was made with correct parameters
    expect(supabase.rpc).toHaveBeenCalledWith('leave_organization', {
      organization_id: 'work'
    });
    
    // Mock account list refresh - organization removed
    const accountsBuilder = supabase.from('accounts') as any;
    accountsBuilder.select.mockResolvedValueOnce('*', {
      data: [mockAccounts[0], mockAccounts[2]], // Work account removed
      error: null
    });
    
    // Verify success message and account list update
    await waitFor(() => {
      expect(screen.getByText(/left organization/i)).toBeInTheDocument();
      expect(screen.queryByText('Work Account')).not.toBeInTheDocument();
    });
  });
  
  test('Handles account switching errors', async () => {
    // Render account switcher
    render(<AccountSwitcher />);
    
    // Wait for accounts to load
    await waitFor(() => {
      expect(screen.getByText('Work Account')).toBeInTheDocument();
    });
    
    // Mock error during account switch
    supabase.rpc = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { message: 'Error switching accounts' }
    });
    
    // Try to switch accounts
    await user.click(screen.getByText('Work Account'));
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/error switching accounts/i)).toBeInTheDocument();
    });
    
    // Verify page was not reloaded
    const mockReload = window.location.reload;
    expect(mockReload).not.toHaveBeenCalled();
  });
});
