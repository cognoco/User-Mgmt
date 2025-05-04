import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface ActivityLogEntry {
  id: string;
  user_id: string;
  action: string;
  status: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  target_resource_type?: string;
  target_resource_id?: string;
  details?: Record<string, any>;
}

const ActivityLog: React.FC = () => {
  const user = useAuth().user;
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    fetch(`/api/audit/user-actions?page=${page}&limit=${limit}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
      })
      .catch((err) => {
        setError('Failed to load activity log.');
      })
      .finally(() => setLoading(false));
  }, [user, page]);

  if (!user) return null;

  return (
    <div className="rounded border p-4 max-w-2xl mx-auto bg-white shadow mt-6">
      <h3 className="text-lg font-semibold mb-2">Account Activity Log</h3>
      {loading ? (
        <div className="text-gray-500">Loading activity log...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : logs.length === 0 ? (
        <div className="text-gray-500">No activity found.</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">IP</th>
              <th className="px-4 py-2 text-left">Device</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2">{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.status}</td>
                <td className="px-4 py-2">{log.ip_address || '-'}</td>
                <td className="px-4 py-2">{log.user_agent ? log.user_agent.split(' ')[0] : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ActivityLog;
