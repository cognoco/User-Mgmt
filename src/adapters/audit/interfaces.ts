import { AuditLogEntry, AuditLogQuery } from '@/core/audit/models';

export interface AuditDataProvider {
  getUserActionLogs(
    query: AuditLogQuery
  ): Promise<{ logs: AuditLogEntry[]; count: number }>;
}
