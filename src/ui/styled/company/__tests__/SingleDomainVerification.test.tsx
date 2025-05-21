import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SingleDomainVerification } from '@/ui/styled/company/SingleDomainVerification';
import { api } from '@/lib/api/axios';
import { act } from 'react-dom/test-utils';


describe('SingleDomainVerification', () => {
  const mockDomain = {
    id: 'domain-123',
    company_id: 'company-123',
    domain: 'example.com',
    is_primary: true,
    is_verified: false,
    verification_token: null,
    verification_method: 'dns_txt',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };
  
  const mockVerificationToken = 'verification-token-123';
  const mockOnVerificationComplete = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default API responses
    (api.post as any).mockImplementation((url: string) => {
      if (url.includes('verify-initiate')) {
        return Promise.resolve({
          data: {
            verificationToken: mockVerificationToken,
            domain: mockDomain.domain,
            message: 'Verification initiated successfully'
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
      return Promise.reject(new Error('Invalid URL'));
    });
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders idle state when domain is not verified and has no token', () => {
    render(<SingleDomainVerification 
      domain={mockDomain} 
      onVerificationComplete={mockOnVerificationComplete} 
    />);
    
    // Should show initiate button in idle state
    expect(screen.getByRole('button', { name: /initiate verification/i })).toBeInTheDocument();
    
    // Should not show token or verified state
    expect(screen.queryByText(/TXT record/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/domain is verified/i)).not.toBeInTheDocument();
  });
  
  test('renders verified state when domain is verified', () => {
    const verifiedDomain = { ...mockDomain, is_verified: true };
    
    render(<SingleDomainVerification 
      domain={verifiedDomain} 
      onVerificationComplete={mockOnVerificationComplete} 
    />);
    
    // Should show verified message
    expect(screen.getByText(/domain.*is verified/i)).toBeInTheDocument();
    
    // Should not show buttons or token
    expect(screen.queryByRole('button', { name: /initiate verification/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/TXT record/i)).not.toBeInTheDocument();
  });
  
  test('renders pending state when domain has verification token', () => {
    const pendingDomain = { 
      ...mockDomain, 
      verification_token: mockVerificationToken 
    };
    
    render(<SingleDomainVerification 
      domain={pendingDomain} 
      onVerificationComplete={mockOnVerificationComplete} 
    />);
    
    // Should show token and instructions
    expect(screen.getByText(/TXT record/i)).toBeInTheDocument();
    expect(screen.getByText(mockVerificationToken)).toBeInTheDocument();
    
    // Should show check button but not initiate button
    expect(screen.getByRole('button', { name: /check verification/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /initiate verification/i })).not.toBeInTheDocument();
  });
  
  test('initiates verification and shows token when button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<SingleDomainVerification 
      domain={mockDomain} 
      onVerificationComplete={mockOnVerificationComplete} 
    />);
    
    // Click initiate button
    const initiateButton = screen.getByRole('button', { name: /initiate verification/i });
    await act(async () => {
      await user.click(initiateButton);
    });
    
    // API should be called
    expect(api.post).toHaveBeenCalledWith(`/api/company/domains/${mockDomain.id}/verify-initiate`);
    
    // Should transition to pending state with token
    await waitFor(() => {
      expect(screen.getByText(/TXT record/i)).toBeInTheDocument();
      expect(screen.getByText(mockVerificationToken)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /check verification/i })).toBeInTheDocument();
    });
    
    // Success alert should be shown
    expect(screen.getByText(/verification initiated successfully/i)).toBeInTheDocument();
  });
  
  test('checks verification status and transitions to verified state on success', async () => {
    const user = userEvent.setup();
    const pendingDomain = { 
      ...mockDomain, 
      verification_token: mockVerificationToken 
    };
    
    render(<SingleDomainVerification 
      domain={pendingDomain} 
      onVerificationComplete={mockOnVerificationComplete} 
    />);
    
    // Click check button
    const checkButton = screen.getByRole('button', { name: /check verification/i });
    await act(async () => {
      await user.click(checkButton);
    });
    
    // API should be called
    expect(api.post).toHaveBeenCalledWith(`/api/company/domains/${mockDomain.id}/verify-check`);
    
    // Should transition to verified state
    await waitFor(() => {
      expect(screen.getByText(/domain successfully verified/i)).toBeInTheDocument();
      expect(screen.getByText(/domain.*is verified/i)).toBeInTheDocument();
    });
    
    // Should not show token or buttons anymore
    expect(screen.queryByText(/TXT record/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /check verification/i })).not.toBeInTheDocument();
    
    // Callback should be called
    expect(mockOnVerificationComplete).toHaveBeenCalled();
  });
  
  test('shows error message when verification fails', async () => {
    const user = userEvent.setup();
    const pendingDomain = { 
      ...mockDomain, 
      verification_token: mockVerificationToken 
    };
    
    // Mock failed verification
    (api.post as any).mockImplementationOnce((url: string) => {
      if (url.includes('verify-check')) {
        return Promise.resolve({
          data: {
            verified: false,
            message: 'Verification failed. TXT record not found.'
          }
        });
      }
      return Promise.reject(new Error('Invalid URL'));
    });
    
    render(<SingleDomainVerification 
      domain={pendingDomain} 
      onVerificationComplete={mockOnVerificationComplete} 
    />);
    
    // Click check button
    const checkButton = screen.getByRole('button', { name: /check verification/i });
    await act(async () => {
      await user.click(checkButton);
    });
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
    });
    
    // Should still be in pending state
    expect(screen.getByText(/TXT record/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check verification/i })).toBeInTheDocument();
    
    // Callback should not be called
    expect(mockOnVerificationComplete).not.toHaveBeenCalled();
  });
  
  test('handles API errors gracefully during initiation', async () => {
    const user = userEvent.setup();
    
    // Mock API error
    (api.post as any).mockRejectedValueOnce({
      response: {
        data: {
          error: 'Failed to initiate verification'
        }
      }
    });
    
    render(<SingleDomainVerification 
      domain={mockDomain} 
      onVerificationComplete={mockOnVerificationComplete} 
    />);
    
    // Click initiate button
    const initiateButton = screen.getByRole('button', { name: /initiate verification/i });
    await act(async () => {
      await user.click(initiateButton);
    });
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to initiate verification/i)).toBeInTheDocument();
    });
    
    // Should remain in idle state
    expect(screen.getByRole('button', { name: /initiate verification/i })).toBeInTheDocument();
    expect(screen.queryByText(/TXT record/i)).not.toBeInTheDocument();
  });
  
  test('handles API errors gracefully during verification check', async () => {
    const user = userEvent.setup();
    const pendingDomain = { 
      ...mockDomain, 
      verification_token: mockVerificationToken 
    };
    
    // Mock API error
    (api.post as any).mockRejectedValueOnce({
      response: {
        data: {
          error: 'Failed to check verification'
        }
      }
    });
    
    render(<SingleDomainVerification 
      domain={pendingDomain} 
      onVerificationComplete={mockOnVerificationComplete} 
    />);
    
    // Click check button
    const checkButton = screen.getByRole('button', { name: /check verification/i });
    await act(async () => {
      await user.click(checkButton);
    });
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to check verification/i)).toBeInTheDocument();
    });
    
    // Should remain in pending state
    expect(screen.getByText(/TXT record/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check verification/i })).toBeInTheDocument();
  });
  
  test('copies verification token to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    const pendingDomain = { 
      ...mockDomain, 
      verification_token: mockVerificationToken 
    };
    
    render(<SingleDomainVerification 
      domain={pendingDomain} 
      onVerificationComplete={mockOnVerificationComplete} 
    />);
    
    // Click copy button
    const copyButton = screen.getByRole('button', { name: '' }); // Copy button has no accessible name
    await act(async () => {
      await user.click(copyButton);
    });
    
    // Clipboard API should be called with the token
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockVerificationToken);
  });
}); 