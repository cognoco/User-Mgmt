import React from 'react';
import type { AuditLogEntry } from '@/core/audit/models';

export interface PermissionSummaryProps {
  logs: AuditLogEntry[];
}

export function PermissionSummary({ logs }: PermissionSummaryProps) {
  return <div>Total changes: {logs.length}</div>;
}
