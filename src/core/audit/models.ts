export interface AuditLogEntry {
  id: string;
  createdAt: string;
  userId?: string;
  action: string;
  status: AuditLogStatus;
  ipAddress?: string;
  userAgent?: string;
  targetResourceType?: string;
  targetResourceId?: string;
  details?: Record<string, any>;
}

export type AuditLogStatus = 'SUCCESS' | 'FAILURE' | 'INITIATED' | 'COMPLETED';

export interface AuditLogCreatePayload
  extends Omit<AuditLogEntry, 'id' | 'createdAt'> {
  /** Optional creation timestamp */
  createdAt?: string;
}

export type AuditLogUpdatePayload = Partial<
  Omit<AuditLogEntry, 'id' | 'createdAt'>
>;

export interface AuditLogResult {
  success: boolean;
  log?: AuditLogEntry;
  error?: string;
}

export interface AuditLogQuery {
  page: number;
  limit: number;
  userId?: string;
  action?: string;
  status?: AuditLogStatus;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  userAgent?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  format?: 'csv' | 'json' | 'xlsx' | 'pdf';
}
