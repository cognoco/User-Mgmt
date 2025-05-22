import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, MockInstance } from 'vitest';
import { api } from '@/lib/api/axios';
import IDPConfiguration from '../IDPConfiguration';
import { createMockSamlConfig, createMockOidcConfig } from '@/tests/mocks/test-mocks';

// Mock the api
vi.mock('@/lib/api/axios', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('@/ui/primitives/tooltip', () => ({
  Tooltip: (props: any) => <div data-testid="tooltip">{props.children}</div>,
  TooltipTrigger: (props: any) => <div data-testid="tooltip-trigger">{props.children}</div>,
  TooltipContent: (props: any) => <div data-testid="tooltip-content">{props.children}</div>,
  TooltipProvider: (props: any) => <div data-testid="tooltip-provider">{props.children}</div>,
}));

beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    configurable: true,
  });
});

describe('IDPConfiguration', () => {
  const mockProps = {
    orgId: 'org123',
    idpType: 'saml' as const,
    onConfigurationUpdate: vi.fn(),
  };

  const mockSamlConfig = createMockSamlConfig();

  const mockOidcConfig = createMockOidcConfig();

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

  it('renders loading state initially', async () => {
    await act(async () => {
      render(<IDPConfiguration {...mockProps} />);
    });
    expect(screen.getByText(/org.sso.samlConfigTitle/i)).toBeInTheDocument();
    expect(screen.getByText(/org.sso.samlConfigDescription/i)).toBeInTheDocument();
  });

  it.only('loads and displays SAML configuration', async () => {
    let result: ReturnType<typeof render> | undefined;
    await act(async () => {
      result = render(<IDPConfiguration {...mockProps} />);
    });

    // Debug: log DOM and api.get calls after render and after 1s
    console.log('Rendered DOM:', result?.container.innerHTML);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('After 1s DOM:', result?.container.innerHTML);
    console.log('api.get calls:', (api.get as any).mock.calls);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/organizations/org123/sso/saml/config');
      expect(api.get).toHaveBeenCalledWith('/organizations/org123/sso/metadata');
    });

    if (screen.debug) screen.debug();
    const certTextareaByLabel = screen.getByLabelText(/certificateLabel/i);
    console.log('Certificate textarea value by label:', (certTextareaByLabel as HTMLTextAreaElement).value);
    expect(certTextareaByLabel).toBeInTheDocument();

    const textareas = screen.queryAllByRole('textbox');
    textareas.forEach((ta, i) => {
      console.log(`Textarea[${i}] value:`, (ta as HTMLTextAreaElement).value);
    });

    expect(screen.getByDisplayValue(mockSamlConfig.entity_id)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockSamlConfig.sign_in_url)).toBeInTheDocument();
    const normalize = (str: string) => str.replace(/\r\n|\r|\n/g, '\n');
    expect(result?.container.innerHTML).toContain(normalize(mockSamlConfig.certificate));
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

    await act(async () => {
      render(<IDPConfiguration {...mockProps} idpType="oidc" />);
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/organizations/org123/sso/oidc/config');
    });

    expect(screen.getByDisplayValue(mockOidcConfig.client_id)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockOidcConfig.discovery_url)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockOidcConfig.scopes)).toBeInTheDocument();
  });

  it('handles certificate file upload', async () => {
    await act(async () => {
      render(<IDPConfiguration {...mockProps} />);
    });

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
    
    await act(async () => {
      render(<IDPConfiguration {...mockProps} />);
    });

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

    await act(async () => {
      render(<IDPConfiguration {...mockProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText('org.sso.fetchConfigError')).toBeInTheDocument();
    });
  });

  it('handles configuration save error', async () => {
    (api.put as unknown as MockInstance).mockRejectedValueOnce(new Error('Failed to save'));

    await act(async () => {
      render(<IDPConfiguration {...mockProps} />);
    });

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
    await act(async () => {
      render(<IDPConfiguration {...mockProps} />);
    });

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
    await act(async () => {
      render(<IDPConfiguration {...mockProps} />);
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

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

    await act(async () => {
      render(<IDPConfiguration {...mockProps} idpType="oidc" />);
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const clientIdInput = screen.getByDisplayValue(mockOidcConfig.client_id);
    await userEvent.clear(clientIdInput);

    const submitButton = screen.getByText('org.sso.saveConfigButton');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/Client ID is required/i)).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });
}); 
