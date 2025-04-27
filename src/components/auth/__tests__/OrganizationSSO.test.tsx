import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
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

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params?.time) return `Last login: ${params.time}`;
      if (params?.count !== undefined) return `Logins in last 24h: ${params.count}`;
      return key;
    },
  }),
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
    expect(screen.getByText('org.sso.title')).toBeInTheDocument();
    expect(screen.getByText('org.sso.description')).toBeInTheDocument();
  });

  it('does not show IDP Configuration when SSO is disabled', async () => {
    await act(async () => {
      render(<OrganizationSSO orgId={mockOrgId} />);
    });
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(`/organizations/${mockOrgId}/sso/settings`);
    });

    expect(screen.queryByText('org.sso.samlConfigTitle')).not.toBeInTheDocument();
    expect(screen.queryByText('org.sso.oidcConfigTitle')).not.toBeInTheDocument();
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
      expect(screen.getByText('org.sso.samlConfigTitle')).toBeInTheDocument();
    });

    // Help text should be visible
    expect(screen.getByText('org.sso.helpTitle')).toBeInTheDocument();
    expect(screen.getByText('org.sso.samlHelpText')).toBeInTheDocument();
    expect(screen.getByText('org.sso.saml.helpStep1')).toBeInTheDocument();
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
      expect(screen.getByText('org.sso.oidcConfigTitle')).toBeInTheDocument();
    });

    // Help text should be visible
    expect(screen.getByText('org.sso.helpTitle')).toBeInTheDocument();
    expect(screen.getByText('org.sso.oidcHelpText')).toBeInTheDocument();
    expect(screen.getByText('org.sso.oidc.helpStep1')).toBeInTheDocument();
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
    expect(screen.queryByText('org.sso.samlConfigTitle')).not.toBeInTheDocument();

    // Mock successful SSO enable with SAML
    (api.put as Mock).mockResolvedValueOnce({});
    (api.get as Mock).mockImplementationOnce((url: string) => {
      if (url.includes('/saml/config') || url.includes('/metadata')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not found'));
    });

    // Enable SSO and select SAML
    const ssoSwitch = screen.getByLabelText('org.sso.enableLabel');
    await userEvent.click(ssoSwitch);

    const idpSelect = screen.getByText('org.sso.idpTypePlaceholder');
    await userEvent.click(idpSelect);
    const samlOption = screen.getByText('org.sso.idpTypeSaml');
    await userEvent.click(samlOption);

    const saveButton = screen.getByText('org.sso.saveButton');
    await userEvent.click(saveButton);

    // SAML configuration should now be visible
    await waitFor(() => {
      expect(screen.getByText('org.sso.samlConfigTitle')).toBeInTheDocument();
    });
  });

  it('does not show status indicator when SSO is disabled', async () => {
    await act(async () => {
      render(<OrganizationSSO orgId={mockOrgId} />);
    });
    expect(screen.queryByText('org.sso.status.healthy')).not.toBeInTheDocument();
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
      expect(screen.getByText('org.sso.status.healthy')).toBeInTheDocument();
      expect(screen.getByText(/Last login:/)).toBeInTheDocument();
      expect(screen.getByText(/Logins in last 24h: 42/)).toBeInTheDocument();
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
        return Promise.resolve({ 
          data: { 
            sso_enabled: true, 
            idp_type: 'saml' 
          } 
        });
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

    await waitFor(() => {
      expect(screen.getByText('org.sso.status.warning')).toBeInTheDocument();
      expect(screen.getByText(/Certificate expires soon/)).toBeInTheDocument();
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
        return Promise.resolve({ 
          data: { 
            sso_enabled: true, 
            idp_type: 'saml' 
          } 
        });
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

    await waitFor(() => {
      expect(screen.getByText('org.sso.status.error')).toBeInTheDocument();
      expect(screen.getByText('org.sso.status.noLogins')).toBeInTheDocument();
      expect(screen.getByText(/Failed to connect to IDP/)).toBeInTheDocument();
      expect(screen.getByText(/Logins in last 24h: 0/)).toBeInTheDocument();
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
      expect(screen.getByText(/Logins in last 24h: 42/)).toBeInTheDocument();
    });

    // Update status for next poll
    currentStatus = updatedStatus;

    // Fast-forward 5 minutes
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);

    await waitFor(() => {
      expect(screen.getByText(/Logins in last 24h: 45/)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
}); 
