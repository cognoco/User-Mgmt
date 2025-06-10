import React from 'react';
import type { AuditLogEntry } from '@/core/audit/models';

export interface PermissionLogTimelineProps {
  logs: AuditLogEntry[];
  renderItem: (log: AuditLogEntry) => React.ReactNode;
}

export function PermissionLogTimeline({ logs, renderItem }: PermissionLogTimelineProps) {
  return (
    <div>{logs.map(log => <div key={log.id}>{renderItem(log)}</div>)}</div>
  );
}
