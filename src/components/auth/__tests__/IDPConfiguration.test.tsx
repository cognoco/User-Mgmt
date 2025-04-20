import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, MockInstance } from 'vitest';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { api } from '@/lib/api/axios';
import IDPConfiguration from '../IDPConfiguration';

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
    t: (key: string) => key,
  }),
}));

describe('IDPConfiguration', () => {
  const mockProps = {
    orgId: 'org123',
    idpType: 'saml' as const,
    onConfigurationUpdate: vi.fn(),
  };

  const mockSamlConfig = {
    entity_id: 'https://test.idp.com',
    sign_in_url: 'https://test.idp.com/login',
    sign_out_url: 'https://test.idp.com/logout',
    certificate: '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----',
    attribute_mapping: {
      email: 'email',
      name: 'name',
      role: 'role',
    },
  };

  const mockOidcConfig = {
    client_id: 'client123',
    client_secret: 'secret123',
    discovery_url: 'https://test.idp.com/.well-known/openid-configuration',
    scopes: 'openid email profile',
    attribute_mapping: {
      email: 'email',
      name: 'name',
      role: 'role',
    },
  };

  const mockMetadata = {
    url: 'https://app.com/metadata',
    entity_id: 'https://app.com',
    xml: '<?xml version="1.0"?>...',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as unknown as MockInstance).mockImplementation((url: string) => {
      if (url.includes('/config')) {
        return Promise.resolve({ data: mockSamlConfig });
      }
      if (url.includes('/metadata')) {
        return Promise.resolve({ data: mockMetadata });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders loading state initially', () => {
    render(<IDPConfiguration {...mockProps} />);
    expect(screen.getByText(/org.sso.samlConfigTitle/i)).toBeInTheDocument();
    expect(screen.getByText(/org.sso.samlConfigDescription/i)).toBeInTheDocument();
  });

  it('loads and displays SAML configuration', async () => {
    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/organizations/org123/sso/saml/config');
      expect(api.get).toHaveBeenCalledWith('/organizations/org123/sso/metadata');
    });

    expect(screen.getByDisplayValue(mockSamlConfig.entity_id)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockSamlConfig.sign_in_url)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockSamlConfig.certificate)).toBeInTheDocument();
  });

  it('loads and displays OIDC configuration', async () => {
    (api.get as unknown as MockInstance).mockImplementation((url: string) => {
      if (url.includes('/config')) {
        return Promise.resolve({ data: mockOidcConfig });
      }
      if (url.includes('/metadata')) {
        return Promise.resolve({ data: mockMetadata });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<IDPConfiguration {...mockProps} idpType="oidc" />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/organizations/org123/sso/oidc/config');
    });

    expect(screen.getByDisplayValue(mockOidcConfig.client_id)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockOidcConfig.discovery_url)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockOidcConfig.scopes)).toBeInTheDocument();
  });

  it('handles certificate file upload', async () => {
    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const file = new File(['test certificate content'], 'cert.pem', { type: 'application/x-pem-file' });
    const fileInput = screen.getByLabelText(/org.sso.saml.certificateLabel/i) as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    expect(fileInput.files?.[0]).toBe(file);
  });

  it('submits SAML configuration successfully', async () => {
    (api.put as unknown as MockInstance).mockResolvedValueOnce({});
    
    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const submitButton = screen.getByText('org.sso.saveConfigButton');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/organizations/org123/sso/saml/config',
        expect.objectContaining({
          entity_id: mockSamlConfig.entity_id,
          sign_in_url: mockSamlConfig.sign_in_url,
          certificate: mockSamlConfig.certificate,
        })
      );
      expect(screen.getByText('org.sso.saveConfigSuccess')).toBeInTheDocument();
      expect(mockProps.onConfigurationUpdate).toHaveBeenCalledWith(true);
    });
  });

  it('handles configuration fetch error', async () => {
    (api.get as unknown as MockInstance).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('org.sso.fetchConfigError')).toBeInTheDocument();
    });
  });

  it('handles configuration save error', async () => {
    (api.put as unknown as MockInstance).mockRejectedValueOnce(new Error('Failed to save'));

    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const submitButton = screen.getByText('org.sso.saveConfigButton');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('org.sso.saveConfigError')).toBeInTheDocument();
      expect(mockProps.onConfigurationUpdate).toHaveBeenCalledWith(false);
    });
  });

  it('switches between configuration and metadata tabs', async () => {
    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const metadataTab = screen.getByText('org.sso.metadataTab');
    await userEvent.click(metadataTab);

    expect(screen.getByText('org.sso.spMetadataTitle')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockMetadata.url)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockMetadata.entity_id)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockMetadata.xml)).toBeInTheDocument();
  });

  it('validates required fields for SAML configuration', async () => {
    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    // Clear required fields
    const entityIdInput = screen.getByDisplayValue(mockSamlConfig.entity_id);
    await userEvent.clear(entityIdInput);

    const submitButton = screen.getByText('org.sso.saveConfigButton');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/Entity ID is required/i)).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });

  it('validates required fields for OIDC configuration', async () => {
    (api.get as unknown as MockInstance).mockImplementation((url: string) => {
      if (url.includes('/config')) {
        return Promise.resolve({ data: mockOidcConfig });
      }
      if (url.includes('/metadata')) {
        return Promise.resolve({ data: mockMetadata });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<IDPConfiguration {...mockProps} idpType="oidc" />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    // Clear required fields
    const clientIdInput = screen.getByDisplayValue(mockOidcConfig.client_id);
    await userEvent.clear(clientIdInput);

    const submitButton = screen.getByText('org.sso.saveConfigButton');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/Client ID is required/i)).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });
}); 
