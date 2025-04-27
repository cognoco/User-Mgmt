import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SessionManagement from '../SessionManagement';
import { useSessionStore } from '@/lib/stores/session.store';

// Mock Zustand store
vi.mock('@/lib/stores/session.store');

const mockSessions = [
  {
    id: 'session-1',
    user_agent: 'Chrome on Windows',
    ip_address: '192.168.1.1',
    last_active_at: new Date().toISOString(),
    is_current: true,
  },
  {
    id: 'session-2',
    user_agent: 'Safari on iPhone',
    ip_address: '10.0.0.2',
    last_active_at: new Date(Date.now() - 100000).toISOString(),
    is_current: false,
  },
];

describe('SessionManagement', () => {
  let fetchSessions: any;
  let revokeSession: any;

  beforeEach(() => {
    fetchSessions = vi.fn();
    revokeSession = vi.fn();
    (useSessionStore as any).mockReturnValue({
      sessions: mockSessions,
      sessionLoading: false,
      sessionError: '',
      fetchSessions,
      revokeSession,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders session list and highlights current session', async () => {
    await act(async () => {
      render(<SessionManagement />);
    });
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
    expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
    expect(screen.getByText('(Current)')).toBeInTheDocument();
    expect(screen.getByText('Revoke')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls revokeSession when Revoke button is clicked', async () => {
    await act(async () => {
      render(<SessionManagement />);
    });
    const revokeBtn = screen.getByText('Revoke');
    await act(async () => {
      await userEvent.click(revokeBtn);
    });
    await waitFor(() => {
      expect(revokeSession).toHaveBeenCalledWith('session-2');
    });
  });

  it('shows loading state', async () => {
    (useSessionStore as any).mockReturnValue({
      sessions: [],
      sessionLoading: true,
      sessionError: '',
      fetchSessions,
      revokeSession,
    });
    await act(async () => {
      render(<SessionManagement />);
    });
    expect(screen.getByText('Loading sessions...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    (useSessionStore as any).mockReturnValue({
      sessions: [],
      sessionLoading: false,
      sessionError: 'Failed to fetch',
      fetchSessions,
      revokeSession,
    });
    await act(async () => {
      render(<SessionManagement />);
    });
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    (useSessionStore as any).mockReturnValue({
      sessions: [],
      sessionLoading: false,
      sessionError: '',
      fetchSessions,
      revokeSession,
    });
    await act(async () => {
      render(<SessionManagement />);
    });
    expect(screen.getByText('No active sessions found.')).toBeInTheDocument();
  });
});
