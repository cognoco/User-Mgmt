import React, { useEffect } from 'react';
import { useSessionStore } from '@/lib/stores/session.store';

const SessionManagement: React.FC = () => {
  const {
    sessions,
    sessionLoading,
    sessionError,
    fetchSessions,
    revokeSession,
  } = useSessionStore();

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevoke = async (sessionId: string) => {
    await revokeSession(sessionId);
  };

  return (
    <div className="rounded border p-4 max-w-lg mx-auto bg-white shadow">
      <h3 className="text-lg font-semibold mb-2">Active Sessions</h3>
      {sessionLoading ? (
        <div className="text-gray-500">Loading sessions...</div>
      ) : sessionError ? (
        <div className="text-red-600">{sessionError}</div>
      ) : sessions.length === 0 ? (
        <div className="text-gray-500">No active sessions found.</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Device</th>
              <th className="px-4 py-2 text-left">IP</th>
              <th className="px-4 py-2 text-left">Last Active</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className={session.is_current ? 'bg-blue-50' : ''}>
                <td className="px-4 py-2">
                  {session.user_agent || 'Unknown'}
                  {session.is_current && (
                    <span className="ml-2 text-xs text-blue-600 font-semibold">(Current)</span>
                  )}
                </td>
                <td className="px-4 py-2">{session.ip_address || '-'}</td>
                <td className="px-4 py-2">{session.last_active_at ? new Date(session.last_active_at).toLocaleString() : '-'}</td>
                <td className="px-4 py-2">
                  {session.is_current ? (
                    <span className="text-gray-400">Active</span>
                  ) : (
                    <button
                      className="text-red-600 hover:underline disabled:opacity-50"
                      onClick={() => handleRevoke(session.id)}
                      disabled={sessionLoading}
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SessionManagement;
