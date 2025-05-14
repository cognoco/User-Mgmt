import '@/tests/i18nTestSetup';
import React from 'react';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, Mock } from 'vitest';
import { api } from '@/lib/api/axios';
import OrganizationSSO from '../OrganizationSSO';

// Mock the api
vi.mock('@/lib/api/axios', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: (props: any) => <div data-testid="tooltip">{props.children}</div>,
  TooltipTrigger: (props: any) => <div data-testid="tooltip-trigger">{props.children}</div>,
  TooltipContent: (props: any) => <div data-testid="tooltip-content">{props.children}</div>,
  TooltipProvider: (props: any) => <div data-testid="tooltip-provider">{props.children}</div>,
}));

describe('OrganizationSSO', () => {
  const mockOrgId = 'org123';

  const mockSSOSettings = {
    sso_enabled: false,
    idp_type: null,
  };

  const mockSSOStatus = {
    status: 'healthy',
    lastSuccessfulLogin: '2024-03-20T10:00:00Z',
    lastError: null,
    totalSuccessfulLogins24h: 42,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/sso/settings')) {
        return Promise.resolve({ data: mockSSOSettings });
      }
      if (url.includes('/sso/status')) {
        return Promise.resolve({ data: mockSSOStatus });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders BusinessSSOSetup initially', async () => {
    await act(async () => {
      render(<OrganizationSSO orgId={mockOrgId} />);
    });
    expect(screen.getByText('Single Sign-On')).toBeInTheDocument();
    expect(screen.getByText('Configure SSO for your organization')).toBeInTheDocument();
  });

  it('does not show IDP Configuration when SSO is disabled', async () => {
    await act(async () => {
      render(<OrganizationSSO orgId={mockOrgId} />);
    });
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(`/organizations/${mockOrgId}/sso/settings`);
    });

    expect(screen.queryByText('SAML Configuration')).not.toBeInTheDocument();
    expect(screen.queryByText('OIDC Configuration')).not.toBeInTheDocument();
  });

  it('shows SAML configuration when SSO is enabled with SAML', async () => {
    // Mock initial settings fetch
    (api.get as Mock).mockImplementationOnce((url: string) => {
      if (url.includes('/sso/settings')) {
        return Promise.resolve({ 
          data: { 
            sso_enabled: true, 
            idp_type: 'saml' 
          } 
        });
      }
      if (url.includes('/saml/config') || url.includes('/metadata')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<OrganizationSSO orgId={mockOrgId} />);

    await waitFor(() => {
      expect(screen.getByText('SAML Configuration')).toBeInTheDocument();
    });

    // Help text should be visible
    expect(screen.getByText('Need help with SSO setup?')).toBeInTheDocument();
    expect(screen.getByText('Follow these steps to configure SAML SSO for your organization.')).toBeInTheDocument();
    expect(screen.getByText('Obtain your SAML IdP metadata from your provider.')).toBeInTheDocument();
  });

  it('shows OIDC configuration when SSO is enabled with OIDC', async () => {
    // Mock initial settings fetch
    (api.get as Mock).mockImplementationOnce((url: string) => {
      if (url.includes('/sso/settings')) {
        return Promise.resolve({ 
          data: { 
            sso_enabled: true, 
            idp_type: 'oidc' 
          } 
        });
      }
      if (url.includes('/oidc/config') || url.includes('/metadata')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<OrganizationSSO orgId={mockOrgId} />);

    await waitFor(() => {
      expect(screen.getByText('OIDC Configuration')).toBeInTheDocument();
    });

    // Help text should be visible
    expect(screen.getByText('Need help with SSO setup?')).toBeInTheDocument();
    expect(screen.getByText('Follow these steps to configure OIDC SSO for your organization.')).toBeInTheDocument();
    expect(screen.getByText('Obtain your OIDC provider\'s discovery URL.')).toBeInTheDocument();
  });

  it('updates IDP Configuration visibility when SSO settings change', async () => {
    // Mock initial settings fetch (SSO disabled)
    (api.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/sso/settings')) {
        return Promise.resolve({ data: mockSSOSettings });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<OrganizationSSO orgId={mockOrgId} />);

    // Initially, IDP Configuration should not be visible
    expect(screen.queryByText('SAML Configuration')).not.toBeInTheDocument();

    // Mock successful SSO enable with SAML
    (api.put as Mock).mockResolvedValueOnce({});
    (api.get as Mock).mockImplementationOnce((url: string) => {
      if (url.includes('/saml/config') || url.includes('/metadata')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not found'));
    });

    // Enable SSO and select SAML
    const ssoSwitch = await screen.findByRole('switch');
    await userEvent.click(ssoSwitch);

    const idpSelect = screen.getByText('Select an identity provider...');
    await userEvent.click(idpSelect);
    const samlOption = screen.getByText('SAML');
    await userEvent.click(samlOption);

    const saveButton = screen.getByText('Save Settings');
    await userEvent.click(saveButton);

    // SAML configuration should now be visible
    await waitFor(() => {
      expect(screen.getByText('SAML Configuration')).toBeInTheDocument();
    });
  });

  it('does not show status indicator when SSO is disabled', async () => {
    await act(async () => {
      render(<OrganizationSSO orgId={mockOrgId} />);
    });
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
  });

  it('shows status indicator with healthy status', async () => {
    // Mock SSO enabled settings
    (api.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/sso/settings')) {
        return Promise.resolve({ 
          data: { 
            sso_enabled: true, 
            idp_type: 'saml' 
          } 
        });
      }
      if (url.includes('/sso/status')) {
        return Promise.resolve({ data: mockSSOStatus });
      }
      if (url.includes('/saml/config') || url.includes('/metadata')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<OrganizationSSO orgId={mockOrgId} />);

    await waitFor(() => {
      expect(screen.getByText(/Healthy/i)).toBeInTheDocument();
      expect(screen.getByText(/Last login:/i)).toBeInTheDocument();
      expect(screen.getByText(/Logins in last 24h: 42/i, { exact: false })).toBeInTheDocument();
    });
  });

  it('shows warning status with error message', async () => {
    const warningStatus = {
      ...mockSSOStatus,
      status: 'warning',
      lastError: 'Certificate expires soon',
    };

    (api.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/sso/settings')) {
        // Always return enabled
        return Promise.resolve({ data: { sso_enabled: true, idp_type: 'saml' } });
      }
      if (url.includes('/sso/status')) {
        return Promise.resolve({ data: warningStatus });
      }
      if (url.includes('/saml/config') || url.includes('/metadata')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<OrganizationSSO orgId={mockOrgId} />);
    screen.debug(); // Debug output after render

    await waitFor(() => {
      expect(screen.getByText(/Warning/i)).toBeInTheDocument();
      expect(screen.getByText(/Certificate expires soon/i)).toBeInTheDocument();
    });
  });

  it('shows error status with no recent logins', async () => {
    const errorStatus = {
      status: 'error',
      lastSuccessfulLogin: null,
      lastError: 'Failed to connect to IDP',
      totalSuccessfulLogins24h: 0,
    };

    (api.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/sso/settings')) {
        // Always return enabled
        return Promise.resolve({ data: { sso_enabled: true, idp_type: 'saml' } });
      }
      if (url.includes('/sso/status')) {
        return Promise.resolve({ data: errorStatus });
      }
      if (url.includes('/saml/config') || url.includes('/metadata')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<OrganizationSSO orgId={mockOrgId} />);
    screen.debug(); // Debug output after render

    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
      expect(screen.getByText(/No recent logins/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to connect to IDP/i)).toBeInTheDocument();
      // Use getAllByText for '0' and check context
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.some(el => el.parentElement?.textContent?.includes('Logins in last 24h'))).toBe(true);
    });
  });

  it('updates status periodically when SSO is enabled', async () => {
    vi.useFakeTimers();

    const initialStatus = { ...mockSSOStatus };
    const updatedStatus = {
      ...mockSSOStatus,
      totalSuccessfulLogins24h: 45,
    };

    let currentStatus = initialStatus;

    (api.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/sso/settings')) {
        return Promise.resolve({ 
          data: { 
            sso_enabled: true, 
            idp_type: 'saml' 
          } 
        });
      }
      if (url.includes('/sso/status')) {
        return Promise.resolve({ data: currentStatus });
      }
      if (url.includes('/saml/config') || url.includes('/metadata')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<OrganizationSSO orgId={mockOrgId} />);

    await waitFor(() => {
      expect(screen.getByText(/Logins in last 24h: 42/i, { exact: false })).toBeInTheDocument();
    });

    // Update status for next poll
    currentStatus = updatedStatus;

    // Fast-forward 5 minutes
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);

    await waitFor(() => {
      expect(screen.getByText(/Logins in last 24h: 45/i, { exact: false })).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    cleanup();
  });
}); 
