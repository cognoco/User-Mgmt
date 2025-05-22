import React from 'react';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountDeletion } from '../AccountDeletion';

let deleteAccountMock: any;

vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({
    deleteAccount: deleteAccountMock,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('AccountDeletion component', () => {
  beforeEach(() => {
    deleteAccountMock = vi.fn();
  });

  it('opens dialog and confirms deletion', async () => {
    const user = userEvent.setup();
    render(<AccountDeletion />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.type(screen.getByLabelText(/password/i), 'pass');
    await user.type(screen.getByPlaceholderText('DELETE'), 'DELETE');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(deleteAccountMock).toHaveBeenCalledWith('pass');
  });
});
