/**
 * Audit Data Provider Interface
 *
 * Defines the contract for persistence operations related to audit logs.
 * This allows the service layer to remain database-agnostic.
 */
import type {
  AuditLogEntry,
  AuditLogQuery,
  AuditLogCreatePayload,
  AuditLogUpdatePayload,
  AuditLogResult,
} from '@/core/audit/models';

export interface IAuditDataProvider {
  /**
   * Persist a new audit log entry.
   *
   * @param entry - Log entry to store
   * @returns Result with success status and new log id or error
   */
  createLog(entry: AuditLogCreatePayload): Promise<AuditLogResult>;

  /**
   * Retrieve a single audit log entry by id.
   */
  getLog(id: string): Promise<AuditLogEntry | null>;

  /**
   * Retrieve audit log entries using the provided query parameters.
   *
   * @param query - Query filters and pagination options
   * @returns List of logs and total count matching the query
   */
  getLogs(query: AuditLogQuery): Promise<{ logs: AuditLogEntry[]; count: number }>;

  /**
   * Update an existing audit log entry.
   */
  updateLog(id: string, updates: AuditLogUpdatePayload): Promise<AuditLogResult>;

  /**
   * Delete an audit log entry.
   */
  deleteLog(id: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Export audit log entries that match the given query as a downloadable blob.
   *
   * @param query - Query filters for selecting logs to export
   * @returns Blob containing the exported logs
   */
  exportLogs(query: AuditLogQuery): Promise<Blob>;
}
