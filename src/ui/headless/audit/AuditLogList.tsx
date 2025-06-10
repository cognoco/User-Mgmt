import type { AuditLog } from '@/core/audit/types';

export interface AuditLogListProps {
  logs: AuditLog[];
  isLoading?: boolean;
  error?: unknown;
  onSelect?: (log: AuditLog) => void;
}

export function AuditLogList({ logs, isLoading, error, onSelect }: AuditLogListProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Failed to load logs</div>;
  }
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          <th>Action</th>
          <th>Entity</th>
          <th>User</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {logs.map(log => (
          <tr key={log.id} onClick={() => onSelect?.(log)} className="cursor-pointer">
            <td>{log.action}</td>
            <td>{log.entityType}</td>
            <td>{log.userId}</td>
            <td>{log.timestamp.toISOString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
