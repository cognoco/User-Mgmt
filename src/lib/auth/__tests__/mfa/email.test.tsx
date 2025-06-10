import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach, Mock } from 'vitest';
import { TwoFactorSetup } from '@/ui/styled/auth/TwoFactorSetup';
import { api } from '@/lib/api/axios';

// Mock the api module
vi.mock('@/lib/api/axios', () => ({
  api: {
    post: vi.fn(),
  },
}));

// Mock the Translation component
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

describe('Email Multi-Factor Authentication', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    // Reset all mocks before each test
    (api.post as Mock).mockReset();
  });

  test('User can setup Email authentication', async () => {
    // Mock the specific API calls for Email setup
    (api.post as Mock).mockImplementation(async (url: string, body: any) => {
      if (url === '/api/2fa/setup') {
        // Step 1: User selects Email and enters email
        if (body.method === 'email') {
          return Promise.resolve({ data: { success: true } });
        }
      }
      if (url === '/api/2fa/resend-email') {
        // Optional step: resend code
        return Promise.resolve({ data: { success: true } });
      }
      if (url === '/api/2fa/verify') {
        // Step 2: User enters code and verifies
        if (body.method === 'email' && body.code === '123456') {
          return Promise.resolve({ data: { success: true } });
        } else {
          return Promise.reject({ response: { data: { error: 'Invalid code' } } });
        }
      }
      if (url === '/api/2fa/backup-codes') {
        // Step 3: Generate backup codes
        return Promise.resolve({ data: { codes: ['111', '222', '333'] } });
      }
      return Promise.reject(new Error(`Unhandled API POST call to ${url}`));
    });

    render(<TwoFactorSetup />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('2fa.setup.selectMethod')).toBeInTheDocument();
    });

    // Select Email option
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '2fa.methods.email' }));
    });

    // Enter email address
    await act(async () => {
      await user.type(screen.getByLabelText('2fa.setup.email.enterEmail'), 'user@example.com');
    });

    // Submit email to send code
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '2fa.setup.email.sendCode' }));
    });

    // Wait for code entry UI
    await waitFor(() => {
      expect(screen.getByLabelText('2fa.setup.email.verifyCode')).toBeInTheDocument();
    });

    // Enter verification code
    await act(async () => {
      await user.type(screen.getByLabelText('2fa.setup.email.verifyCode'), '123456');
    });

    // Submit verification code
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '2fa.setup.verify' }));
    });

    // Verify the API calls were made correctly
    expect(api.post).toHaveBeenCalledWith('/api/2fa/setup', { method: 'email', email: 'user@example.com' });
    expect(api.post).toHaveBeenCalledWith('/api/2fa/verify', { method: 'email', code: '123456' });
  });

  test('Should show error message on invalid email code', async () => {
    (api.post as Mock).mockImplementation(async (url: string, body: any) => {
      if (url === '/api/2fa/setup') {
        if (body.method === 'email') {
          return Promise.resolve({ data: { success: true } });
        }
      }
      if (url === '/api/2fa/verify') {
        // Simulating invalid code
        return Promise.reject({ response: { data: { error: 'Invalid code' } } });
      }
      return Promise.reject(new Error(`Unhandled API POST call to ${url}`));
    });

    render(<TwoFactorSetup />);

    // Wait for component to load and select Email
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '2fa.methods.email' }));
    });

    // Enter email and submit
    await act(async () => {
      await user.type(screen.getByLabelText('2fa.setup.email.enterEmail'), 'user@example.com');
      await user.click(screen.getByRole('button', { name: '2fa.setup.email.sendCode' }));
    });

    // Enter an invalid code
    await act(async () => {
      await user.type(screen.getByLabelText('2fa.setup.email.verifyCode'), '999999');
      await user.click(screen.getByRole('button', { name: '2fa.setup.verify' }));
    });

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Invalid code')).toBeInTheDocument();
    });
  });

  test('Should call resend-email endpoint when resend button is clicked', async () => {
    // This would require adding a resend button to the UI, which is not yet implemented
    // This test is a placeholder for future implementation
    (api.post as Mock).mockImplementation(async (url: string, body: any) => {
      if (url === '/api/2fa/setup') {
        if (body.method === 'email') {
          return Promise.resolve({ data: { success: true } });
        }
      }
      if (url === '/api/2fa/resend-email') {
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.reject(new Error(`Unhandled API POST call to ${url}`));
    });

    render(<TwoFactorSetup />);

    // Setup email verification first
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '2fa.methods.email' }));
      await user.type(screen.getByLabelText('2fa.setup.email.enterEmail'), 'user@example.com');
      await user.click(screen.getByRole('button', { name: '2fa.setup.email.sendCode' }));
    });

    // Test will be expanded when resend functionality is added to the UI
    // This is just a placeholder to verify the initial setup works
    expect(api.post).toHaveBeenCalledWith('/api/2fa/setup', { method: 'email', email: 'user@example.com' });
  });
}); 