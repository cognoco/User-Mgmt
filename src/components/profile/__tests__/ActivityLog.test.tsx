import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ActivityLog from '../ActivityLog';

// Mock useSession
vi.mock('@/lib/auth/useSession', () => ({
  useSession: () => ({ user: { id: 'user-1' } })
}));

describe('ActivityLog', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        logs: [
          {
            id: 'log-1',
            user_id: 'user-1',
            action: 'LOGIN_SUCCESS',
            status: 'SUCCESS',
            created_at: new Date().toISOString(),
            ip_address: '127.0.0.1',
            user_agent: 'Chrome',
          },
        ],
        pagination: { page: 1, totalPages: 1 }
      })
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders activity log entries', async () => {
    render(<ActivityLog />);
    expect(screen.getByText('Account Activity Log')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('LOGIN_SUCCESS')).toBeInTheDocument();
      expect(screen.getByText('SUCCESS')).toBeInTheDocument();
      expect(screen.getByText('127.0.0.1')).toBeInTheDocument();
      expect(screen.getByText('Chrome')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    global.fetch = vi.fn(() => new Promise(() => {})); // never resolves
    render(<ActivityLog />);
    expect(screen.getByText('Loading activity log...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => 'Error' });
    render(<ActivityLog />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load activity log.')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ logs: [], pagination: { page: 1, totalPages: 1 } })
    });
    render(<ActivityLog />);
    await waitFor(() => {
      expect(screen.getByText('No activity found.')).toBeInTheDocument();
    });
  });
});
