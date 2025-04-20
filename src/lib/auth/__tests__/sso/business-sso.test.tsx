// __tests__/auth/sso/business-sso.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BusinessSSOAuth } from '@/components/auth/BusinessSSOAuth';
import { OrganizationProvider } from '@/lib/context/OrganizationContext';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Import our standardized mock
vi.mock('@/lib/supabase', () => require('../../../__mocks__/supabase'));
import { supabase } from '@/lib/supabase';

// Store original window location
const originalLocation = window.location;

describe('Business SSO Authentication Flows', () => {
  let user: ReturnType<typeof userEvent.setup>;

  // Sample organization data
  const mockOrganization = {
    id: 'org-123',
    name: 'Acme Inc',
    domain: 'acme.com',
    sso_enabled: true,
    sso_provider: 'azure',
    sso_domain_required: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();

    // Mock window.location for redirects using vi.fn
    const mockWindowLocationAssign = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        assign: mockWindowLocationAssign,
        origin: 'https://app.example.com',
        href: 'https://app.example.com/auth'
      },
      writable: true,
      configurable: true
    });

    // Mock auth state (not authenticated)
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: null },
      error: null
    });

    // Mock organization data fetch (used by provider placeholder)
    // The provider placeholder simulates this, so direct mock might not be needed
    // (supabase.from as any)('organizations').select.mockResolvedValueOnce({
    //   data: mockOrganization,
    //   error: null
    // });
  });

  afterEach(() => {
    // Restore original window.location
    Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true
    });
  });

  test('User can sign in with Microsoft/Azure AD', async () => {
    // Mock successful Azure auth
    (supabase.auth.signInWithOAuth as any).mockResolvedValueOnce({
      data: { provider: 'azure', url: 'https://supabase-auth.io/azure-redirect' },
      error: null
    });

    // Render business SSO component within organization context
    render(
      <OrganizationProvider orgId="org-123">
        <BusinessSSOAuth />
      </OrganizationProvider>
    );

    // Wait for component to load organization data (from placeholder provider)
    await waitFor(() => {
      expect(screen.getByText(/acme inc/i)).toBeInTheDocument();
    });

    // Click Microsoft/Azure button
    await user.click(screen.getByRole('button', { name: /microsoft/i }));

    // Verify Supabase auth method was called with correct params
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'azure',
      options: expect.objectContaining({
        redirectTo: expect.stringContaining(window.location.origin),
        queryParams: expect.objectContaining({
          organization_id: 'org-123'
        })
      })
    });

    // Verify user is redirected to Azure auth URL
    expect((window.location.assign as any)).toHaveBeenCalledWith('https://supabase-auth.io/azure-redirect');
  });

  test('User can sign in with Google Workspace', async () => {
    // Update mock organization to use Google Workspace
    (supabase.from as any)('organizations').select.mockReset();
    (supabase.from as any)('organizations').select.mockResolvedValueOnce({
      data: { ...mockOrganization, sso_provider: 'google_workspace' },
      error: null
    });
    
    // Mock successful Google Workspace auth
    (supabase.auth.signInWithOAuth as any).mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://supabase-auth.io/google-workspace-redirect' },
      error: null
    });

    // Render business SSO component
    render(
      <OrganizationProvider orgId="org-123">
        <BusinessSSOAuth />
      </OrganizationProvider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/acme inc/i)).toBeInTheDocument();
    });
    
    // Click Google Workspace button
    await user.click(screen.getByRole('button', { name: /google workspace/i }));
    
    // Verify Supabase auth method was called with correct params
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({
        queryParams: expect.objectContaining({
          access_type: 'offline',
          hd: 'acme.com', // Host domain parameter for Google Workspace
          organization_id: 'org-123'
        })
      })
    });
  });

  test('Business LinkedIn SSO authentication', async () => {
    // Update mock organization to use LinkedIn
    (supabase.from as any)('organizations').select.mockReset();
    (supabase.from as any)('organizations').select.mockResolvedValueOnce({
      data: { ...mockOrganization, sso_provider: 'linkedin' },
      error: null
    });
    
    // Mock successful LinkedIn auth
    (supabase.auth.signInWithOAuth as any).mockResolvedValueOnce({
      data: { provider: 'linkedin', url: 'https://supabase-auth.io/linkedin-redirect' },
      error: null
    });

    // Render business SSO component
    render(
      <OrganizationProvider orgId="org-123">
        <BusinessSSOAuth />
      </OrganizationProvider>
    );
    
    // Click LinkedIn button
    await user.click(screen.getByRole('button', { name: /linkedin/i }));
    
    // Verify Supabase auth method was called with correct params
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'linkedin',
      options: expect.objectContaining({
        scopes: 'r_emailaddress r_liteprofile',
        queryParams: expect.objectContaining({
          organization_id: 'org-123'
        })
      })
    });
  });

  test('Domain-based organization auto-assignment', async () => {
    // Mock user with corporate email
    const userWithCorporateEmail = {
      id: 'user-456',
      email: 'employee@acme.com'
    };
    
    // Mock successful login without organization
    (supabase.auth.signInWithOAuth as any).mockResolvedValueOnce({
      data: { provider: 'azure', url: 'https://supabase-auth.io/azure-redirect' },
      error: null
    });
    
    // Mock organization domains query
    (supabase.from as any)('organization_domains').select.mockImplementation((table) => {
      if (table === 'organization_domains') {
        return {
          eq: vi.fn().mockResolvedValue({
            data: [{ org_id: 'org-123', domain: 'acme.com', is_verified: true }],
            error: null
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
    });

    // Simulate auth callback with corporate email
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://app.example.com',
        hash: '#access_token=test-token&provider=azure&type=sso',
        href: 'https://app.example.com/auth/callback#access_token=test-token&provider=azure&type=sso'
      },
      writable: true
    });
    
    // Mock session with corporate email
    (supabase.auth.getSession as any).mockResolvedValueOnce({
      data: { 
        session: { 
          access_token: 'test-token',
          user: userWithCorporateEmail
        }
      },
      error: null
    });
    
    // Render component with domain detection
    render(<BusinessSSOAuth detectDomain={true} />);
    
    // Verify domain check and organization assignment
    await waitFor(() => {
      expect((supabase.from as any)('organization_domains').select).toHaveBeenCalled();
    });
    
    // Verify organization auto-assignment
    expect((supabase.from as any)('organization_members').select).toHaveBeenCalled();
    
    // Verify user is redirected to organization dashboard
    expect(screen.getByText(/redirecting to organization/i)).toBeInTheDocument();
    
    // Clean up
    Object.defineProperty(window, 'location', {
      value: {
        assign: vi.fn(),
        origin: 'https://app.example.com',
        hash: '',
        href: 'https://app.example.com/auth'
      },
      writable: true
    });
  });

  test('Organization-wide SSO enforcement', async () => {
    // Mock authenticated user without SSO
    (supabase.auth.getUser as any).mockReset();
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { 
        user: { 
          id: 'user-789', 
          email: 'user@acme.com',
          app_metadata: { provider: 'email' } // Using email login instead of SSO
        }
      },
      error: null
    });
    
    // Update mock organization to enforce SSO
    (supabase.from as any)('organizations').select.mockReset();
    (supabase.from as any)('organizations').select.mockResolvedValueOnce({
      data: { 
        ...mockOrganization, 
        sso_forced: true, // Force SSO for organization
        allow_email_login: false
      },
      error: null
    });
    
    // Render business SSO component
    render(
      <OrganizationProvider orgId="org-123">
        <BusinessSSOAuth enforceSSO={true} />
      </OrganizationProvider>
    );
    
    // Verify SSO enforcement message
    await waitFor(() => {
      expect(screen.getByText(/sso login is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email login is disabled/i)).toBeInTheDocument();
    });
    
    // Verify standard login option is disabled
    expect(screen.queryByRole('button', { name: /sign in with email/i }))
      .toHaveAttribute('disabled');
  });
});
