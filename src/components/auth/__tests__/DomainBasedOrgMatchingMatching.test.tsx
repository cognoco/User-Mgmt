import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DomainBasedOrgMatching } from '../DomainBasedOrgMatching';
import { api } from '@/lib/api/axios';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/index';

// Only mock the API layer
vi.mock('@/lib/api/axios');

// Mock i18n translations for org.domains.* keys
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual<any>('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, params?: Record<string, string>) => {
        // Map org.domains.* keys to English values from en.json
        const map: Record<string, string> = {
          'org.domains.title': 'Organization Domains',
          'org.domains.description': 'Manage the domains associated with your organization. Users with email addresses at these domains can join automatically.',
          'org.domains.currentDomains': 'Current Domains',
          'org.domains.noDomains': 'No domains have been added yet.',
          'org.domains.addDomain': 'Add Domain',
          'org.domains.domainLabel': 'Domain',
          'org.domains.domainDescription': 'Enter the domain you want to allow (e.g. example.com)',
          'org.domains.autoJoinLabel': 'Auto-Join',
          'org.domains.autoJoinDescription': 'Allow users with this domain to join automatically.',
          'org.domains.enforceSSOLabel': 'Enforce SSO',
          'org.domains.enforceSSODescription': 'Require single sign-on for users with this domain.',
          'org.domains.addButton': 'Add',
          'org.domains.verificationTitle': 'Domain Verification',
          'org.domains.verificationDescription': 'Verify your domain to enable secure access.',
          'org.domains.verificationInstructions': 'Add a DNS record to verify your domain. See documentation for details.',
          'org.domains.invalidDomain': 'Enter a valid domain (e.g. example.com)',
          'org.domains.addSuccess': params?.domain ? `Domain ${params.domain} added successfully!` : 'Domain added successfully!',
          'org.domains.addError': 'Failed to add domain. Please try again.',
          'org.domains.fetchError': 'Failed to fetch domains. Please try again.',
          'org.domains.removeSuccess': 'Domain removed successfully!',
          'org.domains.removeError': 'Failed to remove domain. Please try again.',
          'org.domains.verifySuccess': 'Domain verified successfully!',
          'org.domains.verifyError': 'Failed to verify domain. Please try again.',
          'org.domains.updateError': 'Failed to update domain settings. Please try again.',
          'org.domains.domain': 'Domain',
          'org.domains.status': 'Status',
          'org.domains.autoJoin': 'Auto-Join',
          'org.domains.enforceSSO': 'Enforce SSO',
          'org.domains.verified': 'Verified',
          'org.domains.unverified': 'Unverified',
          'org.domains.verify': 'Verify',
          'org.domains.deleteDomain': 'Delete domain',
        };
        return map[key] || key;
      },
      i18n: { changeLanguage: () => Promise.resolve() },
    }),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

describe('DomainBasedOrgMatching (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default API mocks
    vi.spyOn(api, 'get').mockResolvedValue({ data: { domains: [] } });
    vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 'new-domain-id', domain: 'example.com', verified: false, autoJoin: true, enforceSSO: false, createdAt: new Date().toISOString() } });
  });

  it('validates domain format before submission', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />
      </I18nextProvider>
    );

    // Wait for initial load
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    // Type an invalid domain
    const input = screen.getByPlaceholderText('example.com');
    await userEvent.type(input, 'invalid-domain');
    const addButton = screen.getByRole('button', { name: /add/i });
    await userEvent.click(addButton);

    // Should show validation error after submit
    await waitFor(() => {
      expect(screen.getByText('Enter a valid domain (e.g. example.com)')).toBeInTheDocument();
    });

    // API should not be called
    expect(api.post).not.toHaveBeenCalled();

    // Clear and type valid domain
    await userEvent.clear(input);
    await userEvent.type(input, 'example.com');
    await userEvent.tab();

    // No validation error should be shown
    await waitFor(() => {
      expect(screen.queryByText('Enter a valid domain (e.g. example.com)')).not.toBeInTheDocument();
    });

    // Submit form
    await userEvent.click(addButton);

    // API should be called with correct data
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/organizations/test-org/domains', {
        domain: 'example.com',
        autoJoin: true,
        enforceSSO: false,
      });
    });
  });

  it('renders the component with initial state (no domains)', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />
      </I18nextProvider>
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/organizations/test-org/domains'));

    // Title and description (allow SVG in heading)
    expect(screen.getByText((content, node) =>
      !!(node?.tagName === 'H3' && content.includes('Organization Domains'))
    )).toBeInTheDocument();
    expect(screen.getByText(
      'Manage the domains associated with your organization. Users with email addresses at these domains can join automatically.'
    )).toBeInTheDocument();

    // No domains message
    expect(screen.getByText('No domains have been added yet.')).toBeInTheDocument();
    // Add domain form is present
    expect(screen.getByText('Add Domain')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('example.com')).toBeInTheDocument();
  });

  it('shows loading skeletons while fetching initial data', async () => {
    let resolveGet: (value: any) => void;
    vi.spyOn(api, 'get').mockImplementationOnce(() => new Promise(resolve => { resolveGet = resolve; }));

    render(
      <I18nextProvider i18n={i18n}>
        <DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />
      </I18nextProvider>
    );

    // Skeletons should be present while loading (select by class)
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(3);

    // Resolve the API call
    resolveGet!({ data: { domains: [] } });
    await waitFor(() => {
      expect(document.querySelector('.animate-pulse')).toBeNull();
    });
  });

  it('fetches and displays existing domains if present', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({
      data: {
        domains: [
          { id: 'domain1', domain: 'example.com', verified: true, autoJoin: true, enforceSSO: false, createdAt: new Date().toISOString() },
          { id: 'domain2', domain: 'test.org', verified: false, autoJoin: false, enforceSSO: false, createdAt: new Date().toISOString() },
        ],
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    // Table should be present
    expect(screen.getByRole('table')).toBeInTheDocument();
    // Domains should be listed
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('test.org')).toBeInTheDocument();
    // Status badges (allow SVG in badge)
    const verifiedBadges = screen.getAllByText(/Verified/);
    expect(verifiedBadges.length).toBeGreaterThan(0);
    const unverifiedBadges = screen.getAllByText(/Unverified/);
    expect(unverifiedBadges.length).toBeGreaterThan(0);
  });

  it('toggles domains matching when switch is clicked', async () => {
    // Start with domains matching disabled
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { domains_matching_enabled: false, domains: [] } });
    vi.spyOn(api, 'put').mockResolvedValueOnce({ data: { domains_matching_enabled: true } });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();

    await userEvent.click(switchElement);

    expect(api.put).toHaveBeenCalledWith('/api/organizations/test-org/domains/settings', {
      domains_matching_enabled: true,
    });

    // Simulate domains matching enabled after toggle
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { domains_matching_enabled: true, domains: [] } });
    // Wait for UI update
    await waitFor(() => {
      expect(switchElement).toBeChecked();
      expect(screen.getByText('Add Domain')).toBeInTheDocument();
    });
  });

  it('adds a new domain when form is submitted', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { domains_matching_enabled: true, domains: [] } });
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { id: 'new-domain-id', domain: 'example.com', verified: false, autoJoin: true, enforceSSO: false, createdAt: new Date().toISOString() } });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    const domainInput = screen.getByPlaceholderText('example.com');
    await userEvent.type(domainInput, 'example.com');
    const addButton = screen.getByRole('button', { name: /add/i });
    await userEvent.click(addButton);

    expect(api.post).toHaveBeenCalledWith('/api/organizations/test-org/domains', {
      domain: 'example.com',
      autoJoin: true,
      enforceSSO: false,
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/Domain example.com added successfully!/)).toBeInTheDocument();
    });
    // Form should be reset
    expect(domainInput).toHaveValue('');
  });

  it('shows loading state while adding a domain', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { domains_matching_enabled: true, domains: [] } });
    let resolvePost: (value: any) => void;
    vi.spyOn(api, 'post').mockImplementationOnce(() => new Promise(resolve => { resolvePost = resolve; }));

    render(
      <I18nextProvider i18n={i18n}>
        <DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    const input = screen.getByPlaceholderText('example.com');
    await userEvent.type(input, 'example.com');
    const addButton = screen.getByRole('button', { name: /add/i });
    await userEvent.click(addButton);

    // Button should be disabled while loading
    await waitFor(() => expect(addButton).toBeDisabled());

    // Resolve the API call
    resolvePost!({ data: { id: 'new-domain-id', domain: 'example.com', verified: false, autoJoin: true, enforceSSO: false, createdAt: new Date().toISOString() } });

    // Button should be enabled after success
    await waitFor(() => {
      expect(addButton).not.toBeDisabled();
    });
    // Form should be reset
    expect(input).toHaveValue('');
  });

  it('removes a domain when delete button is clicked', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { domains_matching_enabled: true, domains: [ { id: 'domain1', domain: 'example.com', verified: false, autoJoin: true, enforceSSO: false, createdAt: new Date().toISOString() } ] } });
    vi.spyOn(api, 'delete').mockResolvedValueOnce({ data: { success: true } });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    // Find and click delete button in the domain row
    const row = screen.getByText('example.com').closest('tr');
    const deleteButton = within(row!).getByLabelText('Delete domain');
    await userEvent.click(deleteButton);

    expect(api.delete).toHaveBeenCalledWith('/api/organizations/test-org/domains/domain1');

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Domain removed successfully!')).toBeInTheDocument();
    });
  });

  it('shows error message when adding domain fails', async () => {
    vi.spyOn(api, 'post').mockRejectedValueOnce({ response: { status: 400, data: { error: 'Failed to add domain. Please try again.' } } });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText('example.com');
    await userEvent.type(input, 'example.com');
    const addButton = screen.getByRole('button', { name: /add/i });
    await userEvent.click(addButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to add domain. Please try again.')).toBeInTheDocument();
    });
    // Button should be enabled after error
    expect(addButton).not.toBeDisabled();
    // Form should retain value for correction
    expect(input).toHaveValue('example.com');
  });

  it('shows success message when adding domain succeeds', async () => {
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { id: 'new-domain-id', domain: 'example.com', verified: false, autoJoin: true, enforceSSO: false, createdAt: new Date().toISOString() } });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText('example.com');
    await userEvent.type(input, 'example.com');
    const addButton = screen.getByRole('button', { name: /add/i });
    await userEvent.click(addButton);

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/Domain example.com added successfully!/)).toBeInTheDocument();
    });
    // Form should be reset
    expect(input).toHaveValue('');
  });
}); 