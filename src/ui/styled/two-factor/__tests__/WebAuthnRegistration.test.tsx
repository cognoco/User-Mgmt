// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { WebAuthnRegistration } from '@/ui/styled/two-factor/WebAuthnRegistration';

vi.mock('@simplewebauthn/browser', () => ({
  startRegistration: vi.fn()
}));

const { startRegistration } = await import('@simplewebauthn/browser');

describe('WebAuthnRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers security key successfully', async () => {
    (startRegistration as unknown as vi.Mock).mockResolvedValue({ id: 'cred' });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ challenge: 'c' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    global.fetch = fetchMock as any;

    render(<WebAuthnRegistration />);
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(startRegistration).toHaveBeenCalled();
      expect(screen.getByText(/registered successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error when registration fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'fail' }) });
    global.fetch = fetchMock as any;
    render(<WebAuthnRegistration />);
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('fail')).toBeInTheDocument();
    });
  });
});
