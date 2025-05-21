// Mock useAuth BEFORE all imports
const stableUser = { id: 'user-1', email: 'testuser@example.com', name: 'Test User' };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: stableUser })
}));

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import ActivityLog from '../ActivityLog';

describe('ActivityLog', () => {
  beforeEach(() => {
    if (useAuth.setState) {
      useAuth.setState({ user: stableUser, isLoading: false, error: null });
    }
    global.fetch = vi.fn().mockImplementation((...args) => {
      // Debug output
      // eslint-disable-next-line no-console
      console.log('fetch called with:', ...args);
      return Promise.resolve({
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
  });

  afterEach(() => {
    vi.resetAllMocks();
    if (useAuth.setState) {
      useAuth.setState({ user: stableUser, isLoading: false, error: null });
    }
  });

  it('renders activity log entries', async () => {
    await act(async () => {
      render(<ActivityLog />);
    });
    // Debug output
    // eslint-disable-next-line no-console
    console.log('user in test:', useAuth().user);
    expect(screen.getByText('Account Activity Log')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('LOGIN_SUCCESS')).toBeInTheDocument();
      expect(screen.getByText('SUCCESS')).toBeInTheDocument();
      expect(screen.getByText('127.0.0.1')).toBeInTheDocument();
      expect(screen.getByText('Chrome')).toBeInTheDocument();
    }, { timeout: 15000 });
  }, 15000);

  it('shows loading state', async () => {
    global.fetch = vi.fn(() => new Promise(() => {})); // never resolves
    await act(async () => {
      render(<ActivityLog />);
    });
    expect(screen.getByText('Loading activity log...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => 'Error' });
    await act(async () => {
      render(<ActivityLog />);
    });
    await waitFor(() => {
      expect(screen.getByText('Failed to load activity log.')).toBeInTheDocument();
    }, { timeout: 15000 });
  }, 15000);

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ logs: [], pagination: { page: 1, totalPages: 1 } })
    });
    await act(async () => {
      render(<ActivityLog />);
    });
    await waitFor(() => {
      expect(screen.getByText('No activity found.')).toBeInTheDocument();
    }, { timeout: 15000 });
  }, 15000);
});
