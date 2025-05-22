import { PaginationMeta } from '@/lib/api/common/response-formatter';
import { AuditLogEntry, AuditLogQuery } from './models';

export interface AuditService {
  getUserActionLogs(
    query: AuditLogQuery
  ): Promise<{ logs: AuditLogEntry[]; pagination: PaginationMeta }>;
}
