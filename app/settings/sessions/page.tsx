'use client';
import React from 'react';
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/hooks/session/use-session';
import { SessionList } from '@/ui/styled/session/SessionList';

export default function SessionsPage() {
  const { t } = useTranslation();
  const {
    sessions,
    currentSession,
    loading,
    error,
    fetchSessions,
    terminateSession,
    terminateAllOtherSessions
  } = useSession();

  // Fetch sessions on mount
  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-center md:text-left">
        {t('sessions.title', 'Active Sessions')}
      </h1>
      <SessionList
        sessions={sessions}
        currentSessionId={currentSession?.id}
        loading={loading}
        error={error}
        onTerminate={terminateSession}
        onTerminateAll={terminateAllOtherSessions}
      />
    </div>
  );
}
