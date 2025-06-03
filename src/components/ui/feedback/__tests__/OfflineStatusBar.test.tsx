import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import OfflineStatusBar from '../OfflineStatusBar';
import useOfflineStatus from '@/hooks/utils/useOfflineStatus';

vi.mock('@/hooks/utils/useOfflineStatus');

const mockedStatus = useOfflineStatus as unknown as vi.Mock;

describe('OfflineStatusBar', () => {
  it('shows offline message with retry', async () => {
    mockedStatus.mockReturnValue({ isOffline: true, isReconnecting: false });
    const retry = vi.fn();
    const user = userEvent.setup();
    render(<OfflineStatusBar queueLength={2} onRetry={retry} />);
    expect(screen.getByText(/you are offline/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(retry).toHaveBeenCalled();
  });

  it('shows reconnecting state', () => {
    mockedStatus.mockReturnValue({ isOffline: false, isReconnecting: true });
    render(<OfflineStatusBar />);
    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
  });
});
