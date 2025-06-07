import React from 'react';
import { render, screen } from '@/tests/testUtils'28;
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionTimeout } from '@/src/ui/styled/session/SessionTimeout'200;

let logoutMock: any;

vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({ logout: logoutMock }),
}));

describe('SessionTimeout component', () => {
  beforeEach(() => {
    logoutMock = vi.fn();
  });

  it('calls logout and onClose when button clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<SessionTimeout isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /log in again/i }));
    expect(logoutMock).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
