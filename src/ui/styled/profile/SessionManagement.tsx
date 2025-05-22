import React, { useEffect } from 'react';
import { useSessionStore } from '@/lib/stores/session.store';
import { toast } from '@/ui/primitives/use-toast';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/ui/primitives/alert-dialog';

const SessionManagement: React.FC = () => {
  const {
    sessions,
    sessionLoading,
    sessionError,
    fetchSessions,
    revokeSession,
  } = useSessionStore();

  const [pendingSessionId, setPendingSessionId] = React.useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevoke = async () => {
    if (!pendingSessionId) return;
    await revokeSession(pendingSessionId);
    toast({
      title: 'Session revoked',
      description: 'The session has been successfully revoked.',
    });
    setPendingSessionId(null);
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead>
              <tr>
                <th scope="col" className="px-4 py-2 text-left">Device</th>
                <th scope="col" className="px-4 py-2 text-left">IP</th>
                <th scope="col" className="px-4 py-2 text-left">Last Active</th>
                <th scope="col" className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className={session.is_current ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-2">
                    {session.user_agent || 'Unknown'}
                    {session.is_current && (
                      <span className="ml-2 text-xs text-blue-600 font-semibold">
                        (Current)
                        <span className="sr-only">(Current session)</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">{session.ip_address || '-'}</td>
                  <td className="px-4 py-2">{session.last_active_at ? new Date(session.last_active_at).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2">
                    {session.is_current ? (
                      <span className="text-gray-400">Active</span>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="text-red-600 hover:underline disabled:opacity-50"
                            onClick={() => setPendingSessionId(session.id)}
                            disabled={sessionLoading}
                            aria-label="Revoke this session"
                          >
                            Revoke
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Session</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to revoke this session? This will log out the device associated with this session.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setPendingSessionId(null)}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleRevoke} disabled={sessionLoading}>
                              Revoke
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;
