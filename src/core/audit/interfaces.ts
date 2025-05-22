import type { AuditLog, AuditLogFilters } from './types';

export interface AuditService {
  /** Log an event to the audit log */
  logEvent(
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>
  ): Promise<void>;

  /** Retrieve audit logs with optional filtering and pagination */
  getLogs(
    filters: AuditLogFilters,
    page: number,
    pageSize: number
  ): Promise<{ logs: AuditLog[]; total: number }>;

  /** Export audit logs as a blob (e.g. CSV or Excel) */
  exportLogs(filters: AuditLogFilters): Promise<Blob>;
}

