import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainManagement } from '@/ui/styled/company/DomainManagement';
import { api } from '@/lib/api/axios';

const companyId = 'company-123';

const mockDomains = [
  {
    id: 'domain-1',
    company_id: companyId,
    domain: 'example.com',
    is_primary: true,
    is_verified: true,
    verification_token: null,
    verification_method: 'dns_txt',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'domain-2',
    company_id: companyId,
    domain: 'test.com',
    is_primary: false,
    is_verified: false,
    verification_token: null,
    verification_method: 'dns_txt',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

beforeEach(() => {
  vi.clearAllMocks();
  (api.get as any).mockResolvedValue({ data: { domains: mockDomains } });
  (api.post as any).mockResolvedValue({
    data: {
      id: 'domain-3',
      company_id: companyId,
      domain: 'new.com',
      is_primary: false,
      is_verified: false,
      verification_token: null,
      verification_method: 'dns_txt',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  });
  (api.patch as any).mockResolvedValue({ data: {} });
  (api.delete as any).mockResolvedValue({ data: {} });
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('DomainManagement', () => {
  test('fetches and displays domains', async () => {
    render(<DomainManagement companyId={companyId} />);

    expect(api.get).toHaveBeenCalledWith('/api/company/domains');
    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
      expect(screen.getByText('test.com')).toBeInTheDocument();
    });
  });

  test('allows adding a new domain', async () => {
    const user = userEvent.setup();
    render(<DomainManagement companyId={companyId} />);
    await screen.findByText('example.com');

    await user.type(screen.getByPlaceholderText('example.com'), 'new.com');
    await user.click(screen.getByRole('button', { name: /add domain/i }));

    expect(api.post).toHaveBeenCalledWith('/api/company/domains', {
      domain: 'new.com',
      companyId
    });

    await waitFor(() => {
      expect(screen.getByText('new.com')).toBeInTheDocument();
    });
  });

  test('allows setting a domain as primary', async () => {
    const user = userEvent.setup();
    render(<DomainManagement companyId={companyId} />);
    const row = await screen.findByText('test.com');
    const tableRow = row.closest('tr') as HTMLElement;

    await user.click(within(tableRow).getByRole('button', { name: /set as primary/i }));

    expect(api.patch).toHaveBeenCalledWith('/api/company/domains/domain-2', { is_primary: true });
    await waitFor(() => {
      expect(within(tableRow).getByText(/primary/i)).toBeInTheDocument();
    });
  });

  test('allows deleting a domain', async () => {
    const user = userEvent.setup();
    render(<DomainManagement companyId={companyId} />);
    const row = await screen.findByText('test.com');
    const tableRow = row.closest('tr') as HTMLElement;
    const deleteButton = within(tableRow).getAllByRole('button', { name: '' })[1];

    await user.click(deleteButton);

    expect(api.delete).toHaveBeenCalledWith('/api/company/domains/domain-2');
    await waitFor(() => {
      expect(screen.queryByText('test.com')).not.toBeInTheDocument();
    });
  });
});
