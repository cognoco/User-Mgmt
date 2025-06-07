import '@/tests/i18nTestSetup';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock the useSession hook
vi.mock('@/hooks/session/useSession', () => ({
  useSession: () => ({
    sessions: [
      { id: '1', ip_address: '127.0.0.1', user_agent: 'Chrome', last_active_at: '2024-01-01T00:00:00Z', is_current: true },
      { id: '2', ip_address: '10.0.0.2', user_agent: 'Firefox', last_active_at: '2024-01-02T00:00:00Z', is_current: false }
    ],
    currentSession: { id: '1', is_current: true },
    loading: false,
    error: null,
    fetchSessions: vi.fn(),
    terminateSession: vi.fn(),
    terminateAllOtherSessions: vi.fn()
  })
}));

import SessionsPage from '@/app/settings/sessions/page';

describe('SessionsPage', () => {
  it('renders active sessions list', () => {
    render(<SessionsPage />);
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    // The revoke button should be rendered for the second session
    expect(screen.getAllByText('Revoke')).toHaveLength(1);
    expect(screen.getByText('Terminate Other Sessions')).toBeInTheDocument();
  });
});
