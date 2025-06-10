import { logUserAction } from '@/lib/audit/auditLogger';
import type { AuditLogStatus } from '@/core/audit/models';

export interface PermissionChangeLog {
  action: string;
  performedBy?: string;
  targetType?: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  ticket?: string;
  status?: AuditLogStatus;
}

export async function logPermissionChange(params: PermissionChangeLog): Promise<void> {
  const {
    action,
    performedBy,
    targetType,
    targetId,
    before,
    after,
    reason,
    ticket,
    status
  } = params;

  await logUserAction({
    userId: performedBy,
    action,
    status: status ?? 'SUCCESS',
    targetResourceType: targetType,
    targetResourceId: targetId,
    details: {
      ...(before !== undefined ? { before } : {}),
      ...(after !== undefined ? { after } : {}),
      ...(reason ? { reason } : {}),
      ...(ticket ? { ticket } : {})
    }
  });
}
