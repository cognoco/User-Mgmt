// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { WebAuthnLogin } from '@/ui/styled/auth/WebAuthnLogin';

vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: vi.fn()
}));

const { startAuthentication } = await import('@simplewebauthn/browser');

describe('WebAuthnLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('authenticates successfully', async () => {
    (startAuthentication as unknown as vi.Mock).mockResolvedValue({ id: 'cred' });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ challenge: 'c' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: 'u' }) });
    global.fetch = fetchMock as any;
    const onSuccess = vi.fn();
    render(<WebAuthnLogin userId="1" onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(startAuthentication).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith({ user: 'u' });
    });
  });

  it('shows error when authentication fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'bad' }) });
    global.fetch = fetchMock as any;
    render(<WebAuthnLogin userId="1" onSuccess={vi.fn()} />);
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('bad')).toBeInTheDocument();
    });
  });
});
