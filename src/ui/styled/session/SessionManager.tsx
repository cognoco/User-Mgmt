import React from 'react';
import { SessionManager as HeadlessSessionManager } from '@/ui/headless/session/SessionManager';
import SessionList from '@/ui/styled/session/SessionList';

export function SessionManager() {
  return (
    <HeadlessSessionManager
      render={({ sessions, currentSession, loading, error, terminate, terminateOthers }) => (
        <SessionList
          sessions={sessions}
          currentSessionId={currentSession?.id}
          loading={loading}
          error={error}
          onTerminate={terminate}
          onTerminateAll={terminateOthers}
        />
      )}
    />
  );
}

export default SessionManager;
