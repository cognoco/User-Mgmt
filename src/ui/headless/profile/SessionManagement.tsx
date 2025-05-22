/**
 * Headless SessionManagement Component
 *
 * Provides logic for listing and revoking user sessions.
 */

import { useEffect } from 'react';
import { useSessionStore } from '@/lib/stores/session.store';

export interface SessionManagementProps {
  render: (props: SessionManagementRenderProps) => React.ReactNode;
}

export interface SessionManagementRenderProps {
  sessions: ReturnType<typeof useSessionStore>['sessions'];
  loading: boolean;
  error?: string | null;
  revoke: (id: string) => Promise<void>;
  revokeAll: () => Promise<void>;
}

export function SessionManagement({ render }: SessionManagementProps) {
  const {
    sessions,
    sessionLoading,
    sessionError,
    fetchSessions,
    revokeSession,
  } = useSessionStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeAll = async () => {
    for (const s of sessions) {
      if (!s.is_current) await revokeSession(s.id);
    }
  };

  return (
    <>{render({
      sessions,
      loading: sessionLoading,
      error: sessionError,
      revoke: revokeSession,
      revokeAll,
    })}</>
  );
}
