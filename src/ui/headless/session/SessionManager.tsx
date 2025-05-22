'use client';
import React, { useEffect } from 'react';
import { useSession } from '@/hooks/session/use-session';
import type { SessionInfo } from '@/core/session/models';

export interface SessionManagerRenderProps {
  sessions: SessionInfo[];
  currentSession: SessionInfo | null;
  loading: boolean;
  error?: string | null;
  fetchSessions: () => Promise<void>;
  terminate: (id: string) => Promise<void>;
  terminateOthers: () => Promise<void>;
}

export interface SessionManagerProps {
  render: (props: SessionManagerRenderProps) => React.ReactNode;
}

export function SessionManager({ render }: SessionManagerProps) {
  const {
    sessions,
    currentSession,
    loading,
    error,
    fetchSessions,
    terminateSession,
    terminateAllOtherSessions,
  } = useSession();

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  return (
    <>{render({
      sessions,
      currentSession,
      loading,
      error,
      fetchSessions,
      terminate: terminateSession,
      terminateOthers: terminateAllOtherSessions,
    })}</>
  );
}

export default SessionManager;
