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
    (api.get as Mock).mockImplementation((url: string) => {
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

    // TESTING_ISSUES.md: Wait for SAML-specific help text which confirms configuration loaded
    await waitFor(() => {
      const samlSpecificText = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node || !node.textContent) return false;
        return node.textContent.toLowerCase().includes('follow these steps to configure saml sso');
      });
      expect(samlSpecificText.length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    // Help text should be visible
    const helpText = screen.getAllByText((content: string, node: Element | null): boolean => {
      if (!node || !node.textContent) return false;
      return node.textContent.toLowerCase().includes('need help with sso setup');
    });
    expect(helpText.length).toBeGreaterThan(0);
    
    // Check for SAML metadata text
    const metadataText = screen.getAllByText((content: string, node: Element | null): boolean => {
      if (!node || !node.textContent) return false;
      return node.textContent.toLowerCase().includes('obtain your saml idp metadata');
    });
    expect(metadataText.length).toBeGreaterThan(0);
  });

  it('shows OIDC configuration when SSO is enabled with OIDC', async () => {
    // Mock initial settings fetch
    (api.get as Mock).mockImplementation((url: string) => {
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

    // TESTING_ISSUES.md: Wait for OIDC-specific help text which confirms configuration loaded
    await waitFor(() => {
      const oidcSpecificText = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node || !node.textContent) return false;
        return node.textContent.toLowerCase().includes('follow these steps to configure oidc sso');
      });
      expect(oidcSpecificText.length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    // Help text should be visible
    const helpText = screen.getAllByText((content: string, node: Element | null): boolean => {
      if (!node || !node.textContent) return false;
      return node.textContent.toLowerCase().includes('need help with sso setup');
    });
    expect(helpText.length).toBeGreaterThan(0);
    
    // Check for OIDC provider text
    const providerText = screen.getAllByText((content: string, node: Element | null): boolean => {
      if (!node || !node.textContent) return false;
      return node.textContent.toLowerCase().includes('obtain your oidc provider');
    });
    expect(providerText.length).toBeGreaterThan(0);
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
    
    // Update the mock implementation for subsequent get calls
    (api.get as Mock).mockImplementation((url: string) => {
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

    // Enable SSO and select SAML
    const ssoSwitch = await screen.findByRole('switch');
    await userEvent.click(ssoSwitch);

    const idpSelect = screen.getByRole('combobox');
    await userEvent.click(idpSelect);
    
    const samlOption = screen.getByText('SAML');
    await userEvent.click(samlOption);

    const saveButton = screen.getByText('Save Settings');
    await userEvent.click(saveButton);

    // SAML configuration should now be visible
    const samlHeading = await screen.findByRole('heading', { 
      name: /saml configuration/i 
    }, { timeout: 5000 });
    
    expect(samlHeading).toBeInTheDocument();
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
      // TESTING_ISSUES.md: Match heading text with "healthy" in it
      const healthyHeadings = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node) return false;
        const isHeadingElement = node.tagName?.match(/^H[1-6]$/) ? true : false;
        return isHeadingElement && node.textContent?.toLowerCase().includes('healthy') ? true : false;
      });
      expect(healthyHeadings.length).toBeGreaterThan(0);

      // Match "Last login:" text
      const lastLoginText = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node || !node.textContent) return false;
        return node.textContent.toLowerCase().includes('last login:');
      });
      expect(lastLoginText.length).toBeGreaterThan(0);

      // Match the login count text, with placeholder {{count}} if needed
      const loginCountText = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node || !node.textContent) return false;
        return /logins in last 24h:.*?(\d+|{{count}})/i.test(node.textContent);
      });
      expect(loginCountText.length).toBeGreaterThan(0);
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
    await waitFor(() => {
      // TESTING_ISSUES.md: Match heading with "warning" in it
      const warningHeadings = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node) return false;
        const isHeadingElement = node.tagName?.match(/^H[1-6]$/) ? true : false;
        return isHeadingElement && node.textContent?.toLowerCase().includes('warning') ? true : false;
      });
      expect(warningHeadings.length).toBeGreaterThan(0);

      // Match the error message text
      const errorMessageText = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node || !node.textContent) return false;
        return node.textContent.toLowerCase().includes('certificate expires soon');
      });
      expect(errorMessageText.length).toBeGreaterThan(0);
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
    
    await waitFor(() => {
      // TESTING_ISSUES.md: Use getAllByRole for heading elements with "error" text
      const errorHeadings = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node) return false;
        const isHeadingElement = node.tagName?.match(/^H[1-6]$/) ? true : false;
        return isHeadingElement && node.textContent?.toLowerCase().includes('error') ? true : false;
      });
      expect(errorHeadings.length).toBeGreaterThan(0);
      
      // Check for "No recent logins" text
      const noRecentLogins = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node || !node.textContent) return false;
        return node.textContent.toLowerCase().includes('no recent logins');
      });
      expect(noRecentLogins.length).toBeGreaterThan(0);
      
      // Check for "Failed to connect to IDP" text
      const failedToConnect = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node || !node.textContent) return false;
        return node.textContent.toLowerCase().includes('failed to connect to idp');
      });
      expect(failedToConnect.length).toBeGreaterThan(0);
      
      // Check for login count which could be shown as "{{count}}" in the DOM
      const logins24h = screen.getAllByText((content: string, node: Element | null): boolean => {
        if (!node || !node.textContent) return false;
        // Using regex to match any count value including placeholders
        return /logins in last 24h:.*?(0|{{count}})/i.test(node.textContent);
      });
      expect(logins24h.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('updates status periodically when SSO is enabled', async () => {
    // Replace setInterval globally with a mock implementation
    const originalSetInterval = window.setInterval;
    window.setInterval = vi.fn().mockReturnValue(123); // Return a dummy interval ID
    
    try {
      // Setup API mocks
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

      // Wait for initial API calls to complete
      await waitFor(() => {
        // Verify that api.get for status has been called at least once
        expect(api.get).toHaveBeenCalledWith(`/organizations/${mockOrgId}/sso/status`);
      });

      // Verify setInterval was called with the expected polling interval (5 minutes)
      expect(window.setInterval).toHaveBeenCalled();
      const mockSetInterval = window.setInterval as Mock;
      const calls = mockSetInterval.mock.calls;
      
      // Find the call that has the 5-minute interval (300000 ms)
      const pollingIntervalCall = calls.find((call: any[]) => call[1] === 5 * 60 * 1000);
      expect(pollingIntervalCall).toBeDefined();
    } finally {
      // Always restore the original setInterval
      window.setInterval = originalSetInterval;
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    cleanup();
  });
}); 
