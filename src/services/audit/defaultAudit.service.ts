import { AuditService } from '@/core/audit/interfaces';
import type { IAuditDataProvider } from '@/core/audit/IAuditDataProvider';
import type { AuditLogEntry, AuditLogQuery } from '@/core/audit/models';

/**
 * Default implementation of the {@link AuditService} interface.
 *
 * The service delegates persistence to an injected {@link IAuditDataProvider}
 * while exposing high level methods for logging and querying audit events.
 */
export class DefaultAuditService implements AuditService {
  constructor(private provider: IAuditDataProvider) {}

  /** @inheritdoc */
  logEvent(entry: AuditLogEntry): Promise<{ success: boolean; id?: string; error?: string }> {
    return this.provider.createLog(entry);
  }

  /** @inheritdoc */
  getLogs(query: AuditLogQuery): Promise<{ logs: AuditLogEntry[]; count: number }> {
    return this.provider.getLogs(query);
  }

  /** @inheritdoc */
  exportLogs(query: AuditLogQuery): Promise<Blob> {
    return this.provider.exportLogs(query);
  }
}
