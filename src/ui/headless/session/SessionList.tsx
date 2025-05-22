import type { SessionInfo } from '@/core/session/models';
import React from 'react';

export interface SessionListRenderProps {
  sessions: SessionInfo[];
  currentSessionId?: string;
  loading: boolean;
  error?: string | null;
  onTerminate: (id: string) => void;
  onTerminateAll: () => void;
}

export interface SessionListProps extends SessionListRenderProps {
  render: (props: SessionListRenderProps) => React.ReactNode;
}

export function SessionList({ render, ...props }: SessionListProps) {
  return <>{render(props)}</>;
}

export default SessionList;
