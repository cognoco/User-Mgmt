import type { AuditLogEntry, AuditLogQuery } from "./models";

/**
 * High level audit logging service.
 *
 * Implementations should surface validation problems via the returned objects
 * and reserve promise rejection for unexpected failures.
 */
export interface AuditService {
  /**
   * Persist a new audit log entry.
   *
   * @param entry Log information to store
   * @returns Result object indicating success or failure
   */
  logEvent(
    entry: AuditLogEntry,
  ): Promise<{ success: boolean; id?: string; error?: string }>;

  /**
   * Retrieve audit logs using the provided query parameters.
   */
  getLogs(
    query: AuditLogQuery,
  ): Promise<{ logs: AuditLogEntry[]; count: number }>;

  /**
   * Export audit logs that match the query as a downloadable blob.
   */
  exportLogs(query: AuditLogQuery): Promise<Blob>;
}
