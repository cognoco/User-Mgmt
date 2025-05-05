import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, MockInstance } from 'vitest';
import { api } from '@/lib/api/axios';
import IDPConfiguration from '../IDPConfiguration';
import { initializeI18n } from '@/lib/i18n';
import i18n from '@/lib/i18n';
import enTranslations from '@/lib/i18n/locales/en.json';

vi.unmock('react-i18next');

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

beforeAll(async () => {
  await initializeI18n({
    namespace: 'org',
    resources: { en: { org: enTranslations.org } },
    defaultLanguage: 'en',
  });
  // Debug: log the i18n resource store
  // eslint-disable-next-line no-console
  console.log('i18n store:', JSON.stringify(i18n.store?.data, null, 2));
});

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

describe('IDPConfiguration', () => {
  const mockProps = {
    orgId: 'org123',
    idpType: 'saml' as const,
    onConfigurationUpdate: vi.fn(),
  };

  it('renders loading state initially', async () => {
    render(<IDPConfiguration {...mockProps} />);
    expect(screen.getAllByRole('generic', { hidden: true }).some(el => el.className.includes('skeleton'))).toBe(true);
  });

  it('loads and displays SAML configuration', async () => {
    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/organizations/org123/sso/saml/config');
      expect(api.get).toHaveBeenCalledWith('/organizations/org123/sso/metadata');
    });

    expect(screen.getByDisplayValue(mockSamlConfig.entity_id)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockSamlConfig.sign_in_url)).toBeInTheDocument();
    // For certificate, robustly find the textarea by value
    const certificateTextarea = screen.getAllByRole('textbox').find(
      (el) => (el as HTMLTextAreaElement).value === mockSamlConfig.certificate
    ) as HTMLTextAreaElement | undefined;
    expect(certificateTextarea).toBeDefined();
    expect(certificateTextarea?.value).toBe(mockSamlConfig.certificate);
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
    const { container } = render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const file = new File(['test certificate content'], 'cert.pem', { type: 'application/x-pem-file' });
    // Select the hidden file input by id
    const fileInput = container.querySelector('#cert-upload') as HTMLInputElement;
    expect(fileInput).toBeDefined();
    await userEvent.upload(fileInput, file);
    expect(fileInput.files?.[0]).toBe(file);
  });

  it('submits SAML configuration successfully', async () => {
    (api.put as unknown as MockInstance).mockResolvedValueOnce({});
    
    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const submitButton = screen.getByText('Save Configuration');
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
      expect(screen.getByText('Configuration saved successfully!')).toBeInTheDocument();
      expect(mockProps.onConfigurationUpdate).toHaveBeenCalledWith(true);
    });
  });

  it('handles configuration fetch error', async () => {
    (api.get as unknown as MockInstance).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load configuration. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles configuration save error', async () => {
    (api.put as unknown as MockInstance).mockRejectedValueOnce(new Error('Failed to save'));

    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const submitButton = screen.getByText('Save Configuration');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save configuration. Please try again.')).toBeInTheDocument();
      expect(mockProps.onConfigurationUpdate).toHaveBeenCalledWith(false);
    });
  });

  it('switches between configuration and metadata tabs', async () => {
    render(<IDPConfiguration {...mockProps} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const metadataTab = screen.getByText('Metadata');
    await userEvent.click(metadataTab);

    expect(screen.getByText('Service Provider Metadata')).toBeInTheDocument();
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

    const submitButton = screen.getByText('Save Configuration');
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

    const submitButton = screen.getByText('Save Configuration');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/Client ID is required/i)).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });
}); 
