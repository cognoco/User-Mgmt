import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, Mock } from 'vitest';
import { MFAManagementSection } from '../MFAManagementSection';
import { api } from '@/lib/api/axios';

// Mock useAuthStore globally
vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: vi.fn()
}));
import { useAuthStore } from '@/lib/stores/auth.store';

// Mock API globally
vi.mock('@/lib/api/axios');

const mockUserBase = {
  id: 'user-123',
  email: 'user@example.com',
  user_metadata: {}
};

describe('MFAManagementSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders setup prompt when no factors are enrolled', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({ user: { ...mockUserBase, user_metadata: {} } });
    render(<MFAManagementSection />);
    expect(screen.getByText(/setup/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /setup/i })).toBeInTheDocument();
  });

  it('renders enrolled TOTP and SMS factors', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: {
        ...mockUserBase,
        user_metadata: {
          mfaMethods: ['totp', 'sms'],
          totpEnabled: true,
          mfaSmsVerified: true,
          mfaPhone: '+1234567890',
          backupCodes: ['111', '222', '333']
        }
      }
    });
    render(<MFAManagementSection />);
    expect(screen.getByText(/enabled/i)).toBeInTheDocument();
    expect(screen.getByText(/totp/i)).toBeInTheDocument();
    expect(screen.getByText(/sms/i)).toBeInTheDocument();
    expect(screen.getByText(/\*\*\*\*7890/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('removes a factor and shows success', async () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: {
        ...mockUserBase,
        user_metadata: {
          mfaMethods: ['sms'],
          mfaSmsVerified: true,
          mfaPhone: '+1234567890',
          backupCodes: ['111', '222', '333']
        }
      }
    });
    (api.post as Mock).mockResolvedValueOnce({});
    render(<MFAManagementSection />);
    // Click remove button
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /remove/i }));
    });
    // Confirm removal in dialog
    await act(async () => {
      await userEvent.click(screen.getAllByRole('button', { name: /remove/i })[1]);
    });
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/2fa/disable', { method: 'sms' });
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('shows error alert if API fails to remove factor', async () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: {
        ...mockUserBase,
        user_metadata: {
          mfaMethods: ['sms'],
          mfaSmsVerified: true,
          mfaPhone: '+1234567890',
          backupCodes: ['111', '222', '333']
        }
      }
    });
    (api.post as Mock).mockRejectedValueOnce({ response: { data: { error: 'Failed to remove' } } });
    render(<MFAManagementSection />);
    // Click remove button
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /remove/i }));
    });
    // Confirm removal in dialog
    await act(async () => {
      await userEvent.click(screen.getAllByRole('button', { name: /remove/i })[1]);
    });
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/2fa/disable', { method: 'sms' });
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to remove/i);
    });
  });

  it('shows success alert when factor is removed', async () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: {
        ...mockUserBase,
        user_metadata: {
          mfaMethods: ['totp'],
          totpEnabled: true,
          backupCodes: ['111', '222', '333']
        }
      }
    });
    (api.post as Mock).mockResolvedValueOnce({});
    render(<MFAManagementSection />);
    // Click remove button
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /remove/i }));
    });
    // Confirm removal in dialog
    await act(async () => {
      await userEvent.click(screen.getAllByRole('button', { name: /remove/i })[1]);
    });
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
}); 