import React from 'react';
import type { AuditLogEntry } from '@/core/audit/models';
import { usePermissionAuditLogs, UsePermissionAuditLogsOptions } from '@/hooks/audit/usePermissionAuditLogs';

export interface PermissionAuditDashboardProps extends UsePermissionAuditLogsOptions {
  children: (props: { logs: AuditLogEntry[]; isLoading: boolean; }) => React.ReactNode;
}

export function PermissionAuditDashboard({ children, ...options }: PermissionAuditDashboardProps) {
  const { data, isLoading } = usePermissionAuditLogs(options);
  return <>{children({ logs: data?.logs ?? [], isLoading })}</>;
}
