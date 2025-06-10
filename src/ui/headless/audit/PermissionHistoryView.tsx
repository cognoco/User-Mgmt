import React from 'react';
import type { AuditLogEntry } from '@/core/audit/models';

export interface PermissionHistoryViewProps {
  logs: AuditLogEntry[];
}

export function PermissionHistoryView({ logs }: PermissionHistoryViewProps) {
  return (
    <ul>{logs.map(l => <li key={l.id}>{l.action}</li>)}</ul>
  );
}
