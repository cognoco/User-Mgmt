import { useState, useCallback } from 'react';
import type { SessionInfo as Session } from '@/core/session/models';
import { useSessionService } from '@/lib/context/SessionContext';

export function useSession() {
  const sessionService = useSessionService();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionService.listUserSessions('me');
      setSessions(data);
      setCurrentSession(data.find(s => (s as any).is_current) || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [sessionService]);

  const terminateSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await sessionService.revokeUserSession('me', id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to terminate session';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sessionService]);

  const terminateAllOtherSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentId = currentSession?.id;
      for (const s of sessions) {
        if (s.id !== currentId) {
          await sessionService.revokeUserSession('me', s.id);
        }
      }
      setSessions(currentId ? sessions.filter(s => s.id === currentId) : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to terminate sessions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sessionService, sessions, currentSession]);

  return {
    sessions,
    currentSession,
    loading,
    error,
    fetchSessions,
    terminateSession,
    terminateAllOtherSessions
  };
}

export default useSession;
