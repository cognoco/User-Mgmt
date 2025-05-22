import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MFAVerificationForm } from '../MFAVerificationForm';
import { api } from '@/lib/api/axios';

vi.mock('@/lib/api/axios', () => ({ api: { post: vi.fn() } }));

const mockPost = api.post as unknown as ReturnType<typeof vi.fn>;

describe('MFAVerificationForm styled component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits code and calls onSuccess', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValueOnce({ data: { user: { id: 'u1' }, token: 'tok' } });
    const onSuccess = vi.fn();
    render(<MFAVerificationForm accessToken="abc" onSuccess={onSuccess} />);
    await user.type(screen.getByPlaceholderText('000000'), '123456');
    await user.click(screen.getByRole('button', { name: '[i18n:auth.mfa.verifyButton]' }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ id: 'u1' }, 'tok');
    });
  });

  it('shows error on failure', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValueOnce({ response: { data: { error: 'Invalid' } } });
    render(<MFAVerificationForm accessToken="abc" onSuccess={vi.fn()} />);
    await user.type(screen.getByPlaceholderText('000000'), '123456');
    await user.click(screen.getByRole('button', { name: '[i18n:auth.mfa.verifyButton]' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid');
    });
  });

  it('toggles backup code input', async () => {
    const user = userEvent.setup();
    render(<MFAVerificationForm accessToken="abc" onSuccess={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: '[i18n:auth.mfa.useBackupCode]' }));
    expect(screen.getByPlaceholderText('XXXX-XXXX')).toBeInTheDocument();
  });
});
