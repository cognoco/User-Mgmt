import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainVerification } from '../DomainVerification';
import { api } from '@/lib/api';
import { act } from 'react-dom/test-utils';

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  }
}));

// Mock zustand hooks
vi.mock('@/lib/stores/notification-store', () => ({
  useNotificationStore: () => ({
    showNotification: vi.fn(),
    showError: vi.fn()
  })
}));

describe('DomainVerification Integration', () => {
  const companyId = 'company-123';
  
  // Sample domain data
  const mockDomains = [
    {
      id: 'domain-1',
      company_id: companyId,
      domain: 'example.com',
      is_primary: true,
      is_verified: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 'domain-2',
      company_id: companyId,
      domain: 'test.example.com',
      is_primary: false,
      is_verified: false,
      verification_token: 'test-token-123',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  ];
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Default API responses
    (api.get as any).mockResolvedValue({ data: mockDomains });
    (api.post as any).mockResolvedValue({ 
      data: { 
        id: 'new-domain-id', 
        domain: 'new.example.com',
        is_verified: false,
        is_primary: false
      } 
    });
  });
  
  test('renders domain list and allows adding new domains', async () => {
    // Render the component
    render(<DomainVerification companyId={companyId} />);
    
    // Wait for the domains to load
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(`/api/company/domains?companyId=${companyId}`);
    });
    
    // Verify existing domains are displayed
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('test.example.com')).toBeInTheDocument();
    
    // Verify verified status is shown correctly
    expect(screen.getByText(/example\.com.*verified/i)).toBeInTheDocument();
    
    // Click the add domain button
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /add domain/i }));
    
    // Wait for the modal to appear
    const domainInput = await screen.findByLabelText(/domain name/i);
    expect(domainInput).toBeInTheDocument();
    
    // Enter a new domain
    await user.type(domainInput, 'new.example.com');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /add/i }));
    
    // Verify API call was made
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/company/domains', {
        companyId,
        domain: 'new.example.com'
      });
    });
    
    // Reload should be triggered
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
  
  test('handles domain verification flow', async () => {
    // Mock specific responses for this test
    (api.post as any).mockImplementation((url) => {
      if (url.includes('verify-initiate')) {
        return Promise.resolve({
          data: {
            message: 'Verification initiated successfully',
            verification_token: 'verification-token-xyz'
          }
        });
      } else if (url.includes('verify-check')) {
        return Promise.resolve({
          data: {
            verified: true,
            message: 'Domain successfully verified'
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    // Render the component
    render(<DomainVerification companyId={companyId} />);
    
    // Wait for domains to load
    await waitFor(() => {
      expect(screen.getByText('test.example.com')).toBeInTheDocument();
    });
    
    const user = userEvent.setup();
    
    // Find the unverified domain and click initiate verification
    const initiateButton = screen.getByRole('button', { name: /initiate verification/i });
    await user.click(initiateButton);
    
    // Verify API call was made
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(`/api/company/domains/domain-2/verify-initiate`, {
        companyId
      });
    });
    
    // Verification instructions should be displayed
    await waitFor(() => {
      expect(screen.getByText(/TXT record/i)).toBeInTheDocument();
      expect(screen.getByText(/verification-token-xyz/i)).toBeInTheDocument();
    });
    
    // Click the copy button for the token
    const copyButton = screen.getByRole('button', { name: /copy/i });
    
    // Mock clipboard API
    const mockClipboard = {
      writeText: vi.fn().mockImplementation(() => Promise.resolve())
    };
    Object.assign(navigator, { clipboard: mockClipboard });
    
    await user.click(copyButton);
    
    // Verify copy was attempted
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('verification-token-xyz');
    
    // Now check verification
    const checkButton = screen.getByRole('button', { name: /check verification/i });
    await user.click(checkButton);
    
    // Verify the check API call was made
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(`/api/company/domains/domain-2/verify-check`, {
        companyId
      });
    });
    
    // Domain should now show as verified
    await waitFor(() => {
      // Reload should be triggered
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
  
  test('allows setting a domain as primary', async () => {
    // Render the component
    render(<DomainVerification companyId={companyId} />);
    
    // Wait for domains to load
    await waitFor(() => {
      expect(screen.getByText('test.example.com')).toBeInTheDocument();
    });
    
    const user = userEvent.setup();
    
    // Find domain options menu button for the non-primary domain
    const optionsButton = screen.getAllByLabelText(/domain options/i)[1]; // Second domain
    await user.click(optionsButton);
    
    // Click "Set as Primary" option
    const setPrimaryOption = screen.getByText(/set as primary/i);
    await user.click(setPrimaryOption);
    
    // Verify API call was made
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(`/api/company/domains/domain-2/primary`, {
        companyId
      });
    });
    
    // Reload should be triggered
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
  
  test('handles verification failure correctly', async () => {
    // Mock specific responses for this test
    (api.post as any).mockImplementation((url) => {
      if (url.includes('verify-initiate')) {
        return Promise.resolve({
          data: {
            message: 'Verification initiated successfully',
            verification_token: 'verification-token-xyz'
          }
        });
      } else if (url.includes('verify-check')) {
        return Promise.reject({
          response: {
            status: 400,
            data: {
              message: 'Verification failed. TXT record not found.'
            }
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    // Mock notification functions to verify error display
    const showError = vi.fn();
    vi.mocked(useNotificationStore).mockReturnValue({
      showNotification: vi.fn(),
      showError
    });
    
    // Render the component
    render(<DomainVerification companyId={companyId} />);
    
    // Wait for domains to load
    await waitFor(() => {
      expect(screen.getByText('test.example.com')).toBeInTheDocument();
    });
    
    const user = userEvent.setup();
    
    // Find the unverified domain and click initiate verification
    const initiateButton = screen.getByRole('button', { name: /initiate verification/i });
    await user.click(initiateButton);
    
    // Verification instructions should be displayed
    await waitFor(() => {
      expect(screen.getByText(/TXT record/i)).toBeInTheDocument();
    });
    
    // Now check verification (will fail)
    const checkButton = screen.getByRole('button', { name: /check verification/i });
    await user.click(checkButton);
    
    // Verify the error was displayed
    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith('Verification failed. TXT record not found.');
    });
    
    // Verification UI should still be showing
    expect(screen.getByText(/TXT record/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check verification/i })).toBeInTheDocument();
  });
  
  test('allows removing domains', async () => {
    // Mock delete API
    (api.delete as any).mockResolvedValue({ data: { message: 'Domain deleted successfully' } });
    
    // Render the component
    render(<DomainVerification companyId={companyId} />);
    
    // Wait for domains to load
    await waitFor(() => {
      expect(screen.getByText('test.example.com')).toBeInTheDocument();
    });
    
    const user = userEvent.setup();
    
    // Find domain options menu button for non-primary domain
    const optionsButton = screen.getAllByLabelText(/domain options/i)[1]; // Second domain
    await user.click(optionsButton);
    
    // Click "Remove" option
    const removeOption = screen.getByText(/remove domain/i);
    await user.click(removeOption);
    
    // Confirm dialog should appear
    const confirmDialog = await screen.findByText(/are you sure/i);
    expect(confirmDialog).toBeInTheDocument();
    
    // Confirm removal
    const confirmButton = screen.getByRole('button', { name: /remove/i });
    await user.click(confirmButton);
    
    // Verify API call was made
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(`/api/company/domains/domain-2?companyId=${companyId}`);
    });
    
    // Reload should be triggered
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
  
  test('validates domain format when adding new domain', async () => {
    // Mock zustand hooks
    const showError = vi.fn();
    vi.mocked(useNotificationStore).mockReturnValue({
      showNotification: vi.fn(),
      showError
    });
    
    // Render the component
    render(<DomainVerification companyId={companyId} />);
    
    // Wait for domains to load
    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });
    
    // Click the add domain button
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /add domain/i }));
    
    // Wait for the modal to appear
    const domainInput = await screen.findByLabelText(/domain name/i);
    
    // Enter an invalid domain
    await user.type(domainInput, 'invalid-domain');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /add/i }));
    
    // Verify error was shown
    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(expect.stringContaining('Invalid domain format'));
    });
    
    // The dialog should still be open
    expect(domainInput).toBeInTheDocument();
  });
}); 