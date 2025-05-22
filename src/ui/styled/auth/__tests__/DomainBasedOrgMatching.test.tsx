import '@/tests/i18nTestSetup';
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DomainBasedOrgMatching } from '@/ui/styled/auth/DomainBasedOrgMatching';
import { api } from '@/lib/api/axios';
import { z } from 'zod';
import { act } from 'react-dom/test-utils';

// Mock necessary dependencies
vi.mock('@/lib/api/axios');

// Mock UI components
vi.mock('@/ui/primitives/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div data-testid="card" className={className}>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div data-testid="card-title" className={className}>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="card-description">{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div data-testid="card-content" className={className}>{children}</div>,
  CardFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div data-testid="card-footer" className={className}>{children}</div>,
}));

// Add Zod schema to match component
const domainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, 'Enter a valid domain (e.g. example.com)'),
  autoJoin: z.boolean().default(true),
  enforceSSO: z.boolean().default(false),
});

type DomainFormValues = z.infer<typeof domainSchema>;

// Mock form state for form component mocks
interface FormState {
  errors: { domain: undefined | { message: string } };
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
}
const mockFormState: FormState = {
  errors: { domain: undefined },
  isValid: true,
  isDirty: false,
  isSubmitting: false,
  isLoading: false,
};

// Update form mock to use Zod validation
vi.mock('@/ui/primitives/form', () => ({
  Form: ({ children, onSubmit }: { children: React.ReactNode; onSubmit?: (data: DomainFormValues) => Promise<void> }) => {
    // Provide a default no-op async onSubmit if not supplied
    const safeOnSubmit = onSubmit || (async () => {});
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      mockFormState.isSubmitting = true;
      mockFormState.isLoading = true;
      try {
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
          domain: formData.get('domain')?.toString() || '',
          autoJoin: formData.get('autoJoin') !== 'false',
          enforceSSO: formData.get('enforceSSO') === 'true'
        };
        const result = domainSchema.safeParse(data);
        if (!result.success) {
          mockFormState.errors = { domain: { message: result.error.errors[0].message } };
          mockFormState.isValid = false;
          return;
        }
        await safeOnSubmit(result.data);
        mockFormState.errors = { domain: undefined };
        mockFormState.isValid = true;
        (e.target as HTMLFormElement).reset();
      } finally {
        mockFormState.isSubmitting = false;
        mockFormState.isLoading = false;
      }
    };
    return (
      <form 
        data-testid="form" 
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        {children}
      </form>
    );
  },
  FormField: ({ name, render }: { name: string; render: (props: { field: any; formState: FormState }) => React.ReactNode }) => {
    const field = {
      name,
      onChange: () => {
        mockFormState.isDirty = true;
        mockFormState.isValid = true;
        mockFormState.errors = { domain: undefined };
      },
      onBlur: () => {
        if (name === 'domain') {
          const value = (document.querySelector(`input[name="${name}"]`) as HTMLInputElement)?.value;
          const result = domainSchema.shape.domain.safeParse(value);
          if (!result.success) {
            mockFormState.errors = { domain: { message: result.error.errors[0].message } };
            mockFormState.isValid = false;
          }
        }
      },
    };
    return render({ field, formState: mockFormState });
  },
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-label">{children}</div>
  ),
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-description">{children}</div>
  ),
  FormMessage: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-message" role="alert">
      {mockFormState.errors.domain?.message || children}
    </div>
  ),
}));

vi.mock('@/ui/primitives/input', () => {
  const MockInput = React.forwardRef(({ name, onChange, value, placeholder }: any, ref: any) => (
    <input 
      data-testid="input"
      name={name}
      ref={ref}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e)}
    />
  ));
  MockInput.displayName = 'Input'; 
  return { Input: MockInput };
});

vi.mock('@/ui/primitives/button', () => ({
  Button: ({
    children,
    disabled,
    onClick,
    type = 'button',
    className,
    'aria-label': ariaLabel
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit';
    className?: string;
    'aria-label'?: string;
  }) => (
    <button 
      data-testid="button"
      type={type}
      disabled={disabled || mockFormState.isSubmitting || mockFormState.isLoading}
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/ui/primitives/alert', () => ({
  Alert: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <div 
      data-testid="alert" 
      role="alert" 
      className={[
        variant === 'destructive' ? 'destructive' : '',
        className || ''
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

vi.mock('@/ui/primitives/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => 
    <table data-testid="table">{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => 
    <thead data-testid="table-header">{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => 
    <tbody data-testid="table-body">{children}</tbody>,
  TableFooter: ({ children }: { children: React.ReactNode }) => 
    <tfoot data-testid="table-footer">{children}</tfoot>,
  TableHead: ({ children }: { children: React.ReactNode }) => 
    <th data-testid="table-head" scope="col">{children}</th>,
  TableRow: ({ children }: { children: React.ReactNode }) => 
    <tr data-testid="table-row">{children}</tr>,
  TableCell: ({ children }: { children: React.ReactNode }) => 
    <td data-testid="table-cell">{children}</td>,
  TableCaption: ({ children }: { children: React.ReactNode }) => 
    <caption data-testid="table-caption">{children}</caption>,
}));

vi.mock('@/ui/primitives/switch', () => ({
  Switch: ({ checked, onCheckedChange, disabled, 'aria-label': ariaLabel }: { 
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
  }) => (
    <input
      type="checkbox"
      data-testid="switch"
      role="switch"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      aria-label={ariaLabel}
    />
  ),
}));

vi.mock('@/ui/primitives/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="badge" className={className}>
      {children}
    </span>
  ),
}));

// Mock API calls
const mockApiGet = vi.fn();
const mockApiPost = vi.fn();
const mockApiDelete = vi.fn();
const mockApiPut = vi.fn();

vi.mocked(api).get = mockApiGet;
vi.mocked(api).post = mockApiPost;
vi.mocked(api).delete = mockApiDelete;
vi.mocked(api).put = mockApiPut;

// Mock skeleton component
vi.mock('@/ui/primitives/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe('DomainBasedOrgMatching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset success/error states
    screen.queryByRole('alert')?.remove();
    
    // Default mocked responses
    mockApiGet.mockResolvedValue({
      data: {
        domains: [],
      },
    });
    
    mockApiPost.mockResolvedValue({ 
      data: { 
        id: 'new-domain-id', 
        domain: 'example.com', 
        verified: false,
        autoJoin: true,
        enforceSSO: false,
        createdAt: new Date().toISOString()
      } 
    });
  });

  it('renders the component with initial state', async () => {
    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    // Use translation keys for text queries
    expect(screen.getByText('Domain-Based Organization Matching')).toBeInTheDocument();
    expect(screen.getByText('Manage domains for automatic organization matching and SSO enforcement.')).toBeInTheDocument();
    expect(screen.getByText('Current Domains')).toBeInTheDocument();
    expect(screen.getByText('No domains have been added yet.')).toBeInTheDocument();
    expect(screen.getByText('Add Domain')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Verification')).toBeInTheDocument();
  });

  it('shows loading skeletons while fetching initial data', async () => {
    mockApiGet.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });
    
    const skeletons = screen.getAllByTestId(/skeleton/);
    expect(skeletons.length).toBeGreaterThan(0);
    
    await waitFor(() => {
      expect(screen.queryByTestId(/skeleton/)).toBeNull();
    });
  });

  it('fetches and displays existing domains if domains matching is enabled', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        domains_matching_enabled: true,
        domains: [
          { id: 'domain1', domain: 'example.com', verified: true },
          { id: 'domain2', domain: 'test.org', verified: false },
        ],
      },
    });

    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    const switches = screen.getAllByTestId('switch');
    // The first switch is for toggling domain matching
    expect(switches[0]).toBeChecked();
    expect(screen.getByTestId('form')).toBeInTheDocument();
    expect(screen.getByTestId('table')).toBeInTheDocument();
    
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('test.org')).toBeInTheDocument();
    
    const badges = screen.getAllByTestId('badge');
    expect(badges[0]).toHaveTextContent('Current Domains');
    expect(badges[1]).toHaveTextContent('No domains have been added yet.');
  });

  it('toggles domains matching when switch is clicked', async () => {
    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    const switches = screen.getAllByTestId('switch');
    // The first switch is for toggling domain matching
    expect(switches[0]).not.toBeChecked();

    await userEvent.click(switches[0]);
    
    expect(mockApiPut).toHaveBeenCalledWith('/api/organizations/test-org/domains/settings', {
      domains_matching_enabled: true,
    });

    await waitFor(() => {
      expect(switches[0]).toBeChecked();
      expect(screen.getByTestId('form')).toBeInTheDocument();
    });
  });

  it('adds a new domain when form is submitted', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        domains_matching_enabled: true,
        domains: [],
      },
    });

    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    const domainInput = screen.getByTestId('input');
    await userEvent.type(domainInput, 'example.com');

    const addButton = screen.getByText('Current Domains');
    await userEvent.click(addButton);

    expect(mockApiPost).toHaveBeenCalledWith('/api/organizations/test-org/domains', {
      domain: 'example.com',
    });

    await waitFor(() => {
      expect(screen.getByText('org.domains.addSuccess')).toBeInTheDocument();
    });
  });

  it('shows loading state while adding a domain', async () => {
    let resolvePost: (value: any) => void;
    mockApiPost.mockImplementationOnce(() => new Promise(resolve => {
      resolvePost = resolve;
    }));

    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    // Fill and submit form
    const input = screen.getByTestId('input');
    await userEvent.type(input, 'example.com');

    const addButton = screen.getByRole('button', { name: /org\.domains\.addButton/i });
    await userEvent.click(addButton);

    // Button should be disabled while loading
    await waitFor(() => expect(addButton).toBeDisabled());

    // Resolve the API call
    resolvePost!({ 
      data: { 
        id: 'new-domain-id', 
        domain: 'example.com', 
        verified: false,
        autoJoin: true,
        enforceSSO: false,
        createdAt: new Date().toISOString()
      } 
    });

    // Button should be enabled after success
    await waitFor(() => {
      expect(addButton).not.toBeDisabled();
    });

    // Form should be reset
    expect(input).toHaveValue('');
  });

  it('removes a domain when delete button is clicked', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        domains_matching_enabled: true,
        domains: [
          { id: 'domain1', domain: 'example.com', verified: false },
        ],
      },
    });

    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    const tableBody = screen.getByTestId('table-body');
    const domainRow = within(tableBody).getByText('example.com').closest('tr');
    expect(domainRow).toBeTruthy();

    const deleteButton = within(domainRow!).getByLabelText('org.domains.deleteDomain');
    await userEvent.click(deleteButton);

    expect(mockApiDelete).toHaveBeenCalledWith('/api/organizations/test-org/domains/domain1');

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const successAlert = alerts.find(a => a.textContent?.includes('org.domains.deleteSuccess'));
      expect(successAlert).toBeTruthy();
    });
  });

  it('shows error message when adding domain fails', async () => {
    mockApiPost.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: 'org.domains.addError'
        }
      }
    });

    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    // Fill and submit form
    const input = screen.getByTestId('input');
    await userEvent.type(input, 'example.com');
    await userEvent.tab(); // Trigger blur validation

    const addButton = screen.getByRole('button', { name: /org\.domains\.addButton/i });
    await userEvent.click(addButton);

    // Button should be disabled while submitting
    await waitFor(() => expect(addButton).toBeDisabled());

    // Should show error message
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('destructive');
      expect(within(alert).getByTestId('alert-description')).toHaveTextContent('org.domains.addError');
    });

    // Button should be enabled after error
    expect(addButton).not.toBeDisabled();

    // Form should retain value for correction
    expect(input).toHaveValue('example.com');
  });

  it('shows success message when adding domain succeeds', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: {
        id: 'new-domain-id',
        domain: 'example.com',
        verified: false,
        autoJoin: true,
        enforceSSO: false,
        createdAt: new Date().toISOString()
      }
    });

    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    // Fill and submit form
    const input = screen.getByTestId('input');
    await userEvent.type(input, 'example.com');

    const addButton = screen.getByRole('button', { name: /org\.domains\.addButton/i });
    await userEvent.click(addButton);

    // Should show success message in green alert
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const successAlert = alerts.find(alert => alert.className.includes('bg-green-50'));
      expect(successAlert).toBeTruthy();
      expect(within(successAlert!).getByTestId('alert-description')).toHaveTextContent('org.domains.addSuccess');
    });

    // Form should be reset
    expect(input).toHaveValue('');
  });

  it('shows error message when removing domain fails', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        domains_matching_enabled: true,
        domains: [
          { id: 'domain1', domain: 'example.com', verified: false },
        ],
      },
    });

    mockApiDelete.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: 'org.domains.removeError'
        }
      }
    });

    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/api/organizations/test-org/domains');
    });

    // Find and click delete button in the domain row
    const tableBody = screen.getByTestId('table-body');
    const domainRow = within(tableBody).getByText('example.com').closest('tr');
    const deleteButton = within(domainRow!).getByLabelText('org.domains.deleteDomain');
    await userEvent.click(deleteButton);

    // Should show error message in destructive alert
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const errorAlert = alerts.find(alert => alert.className.includes('destructive'));
      expect(errorAlert).toBeTruthy();
      expect(within(errorAlert!).getByTestId('alert-description')).toHaveTextContent('org.domains.removeError');
    });
  });

  it('validates domain format before submission', async () => {
    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    // Type an invalid domain
    const input = screen.getByTestId('input');
    await userEvent.type(input, 'invalid-domain');
    await userEvent.tab(); // Trigger blur validation

    // Should show validation error
    await waitFor(() => {
      const message = screen.getByTestId('form-message');
      expect(message).toHaveTextContent('Enter a valid domain (e.g. example.com)');
    });

    // API should not be called
    expect(mockApiPost).not.toHaveBeenCalled();

    // Clear and type valid domain
    await userEvent.clear(input);
    await userEvent.type(input, 'example.com');
    await userEvent.tab(); // Trigger blur validation

    // No validation error should be shown
    await waitFor(() => {
      const message = screen.getByTestId('form-message');
      expect(message).not.toHaveTextContent('Enter a valid domain');
    });

    // Submit form
    const addButton = screen.getByRole('button', { name: /org\.domains\.addButton/i });
    await userEvent.click(addButton);

    // Button should be disabled while submitting
    expect(addButton).toBeDisabled();

    // API should be called with correct data
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/api/organizations/test-org/domains', {
        domain: 'example.com',
        autoJoin: true,
        enforceSSO: false,
      });
    });

    // Success message should be shown
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-green-50');
      expect(within(alert).getByTestId('alert-description')).toHaveTextContent('org.domains.addSuccess');
    });

    // Form should be reset
    expect(input).toHaveValue('');
  });

  it('shows error message when fetching domains fails', async () => {
    mockApiGet.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message: 'org.domains.fetchError'
        }
      }
    });
    
    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });
    
    await waitFor(() => {
      const cardContent = screen.getByTestId('card-content');
      const errorAlert = within(cardContent).queryByRole('alert');
      expect(errorAlert).toBeTruthy();
      expect(errorAlert?.textContent).toContain('org.domains.fetchError');
    });
  });

  it('shows loading skeletons while fetching domains', async () => {
    let resolveGet: (value: any) => void;
    mockApiGet.mockImplementationOnce(() => new Promise(resolve => {
      resolveGet = resolve;
    }));

    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    // Should show skeletons while loading
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);

    // Resolve the API call
    resolveGet!({
      data: {
        domains: []
      }
    });

    // Skeletons should be removed
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).toBeNull();
    });
  });

  it('validates domain format on blur', async () => {
    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    const input = screen.getByTestId('input');
    await userEvent.type(input, 'invalid-domain');
    await input.blur();

    await waitFor(() => {
      const message = screen.getByTestId('form-message');
      expect(message).toHaveTextContent('Enter a valid domain (e.g. example.com)');
    });

    expect(mockFormState.isValid).toBe(false);
  });

  it('shows form-level validation message on submit with invalid domain', async () => {
    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    const input = screen.getByTestId('input');
    await userEvent.type(input, 'invalid-domain');

    const addButton = screen.getByRole('button', { name: /org\.domains\.addButton/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('destructive');
      expect(within(alert).getByTestId('alert-description')).toHaveTextContent('org.domains.invalidDomain');
    });

    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('handles successful form submission', async () => {
    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    const input = screen.getByTestId('input');
    await userEvent.type(input, 'example.com');

    expect(mockFormState.isDirty).toBe(true);
    expect(mockFormState.isValid).toBe(true);

    const addButton = screen.getByRole('button', { name: /org\.domains\.addButton/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/api/organizations/test-org/domains', {
        domain: 'example.com',
        autoJoin: true,
        enforceSSO: false,
      });
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-green-50');
      expect(within(alert).getByTestId('alert-description')).toHaveTextContent('org.domains.addSuccess');
    });

    expect(mockFormState.isSubmitting).toBe(false);
    expect(input).toHaveValue('');
    expect(mockFormState.isDirty).toBe(false);
  });

  it('shows loading state while submitting form', async () => {
    // Mock API delay
    mockApiPost.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    await act(async () => {
      render(<DomainBasedOrgMatching organizationId="test-org" organizationName="Test Org" />);
    });

    // Fill and submit form
    const input = screen.getByTestId('input');
    await userEvent.type(input, 'example.com');
    await userEvent.tab(); // Trigger blur validation

    const addButton = screen.getByRole('button', { name: /org\.domains\.addButton/i });
    await userEvent.click(addButton);

    // Should show loading state
    expect(addButton).toBeDisabled();
    expect(mockFormState.isLoading).toBe(true);

    // Wait for API call to complete
    await waitFor(() => {
      expect(mockFormState.isLoading).toBe(false);
      expect(addButton).not.toBeDisabled();
    });
  });
}); 