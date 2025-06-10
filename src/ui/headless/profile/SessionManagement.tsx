/**
 * Headless SessionManagement Component
 *
 * Provides logic for listing and revoking user sessions.
 */

import { useEffect } from 'react';
import { useSession } from '@/hooks/session/useSession';
import type { SessionInfo } from '@/core/session/models';

export interface SessionManagementProps {
  render: (props: SessionManagementRenderProps) => React.ReactNode;
}

export interface SessionManagementRenderProps {
  sessions: SessionInfo[];
  loading: boolean;
  error?: string | null;
  revoke: (id: string) => Promise<void>;
  revokeAll: () => Promise<void>;
}

export function SessionManagement({ render }: SessionManagementProps) {
  const {
    sessions,
    loading,
    error,
    fetchSessions,
    terminateSession,
    terminateAllOtherSessions,
  } = useSession();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeAll = async () => {
    await terminateAllOtherSessions();
  };

  return (
    <>{render({
      sessions,
      loading,
      error,
      revoke: terminateSession,
      revokeAll,
    })}</>
  );
}
