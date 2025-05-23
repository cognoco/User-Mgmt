import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SessionManagement from '../SessionManagement';
import { useSession } from '@/hooks/session/useSession';

// Mock useSession hook
vi.mock('@/hooks/session/useSession');

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
  let terminateSession: any;
  let terminateAllOtherSessions: any;

  beforeEach(() => {
    fetchSessions = vi.fn();
    terminateSession = vi.fn();
    terminateAllOtherSessions = vi.fn();
    (useSession as any).mockReturnValue({
      sessions: mockSessions,
      loading: false,
      error: '',
      fetchSessions,
      terminateSession,
      terminateAllOtherSessions,
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
    const confirmBtn = screen.getAllByText('Revoke').find(
      (btn) => btn !== revokeBtn
    );
    await act(async () => {
      await userEvent.click(confirmBtn!);
    });
    await waitFor(() => {
      expect(terminateSession).toHaveBeenCalledWith('session-2');
    });
  });

  it('shows loading state', async () => {
    (useSession as any).mockReturnValue({
      sessions: [],
      loading: true,
      error: '',
      fetchSessions,
      terminateSession,
      terminateAllOtherSessions,
    });
    await act(async () => {
      render(<SessionManagement />);
    });
    expect(screen.getByText('Loading sessions...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    (useSession as any).mockReturnValue({
      sessions: [],
      loading: false,
      error: 'Failed to fetch',
      fetchSessions,
      terminateSession,
      terminateAllOtherSessions,
    });
    await act(async () => {
      render(<SessionManagement />);
    });
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    (useSession as any).mockReturnValue({
      sessions: [],
      loading: false,
      error: '',
      fetchSessions,
      terminateSession,
      terminateAllOtherSessions,
    });
    await act(async () => {
      render(<SessionManagement />);
    });
    expect(screen.getByText('No active sessions found.')).toBeInTheDocument();
  });
});
