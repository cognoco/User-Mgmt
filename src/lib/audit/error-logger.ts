import { logUserAction } from './auditLogger';
import { ApiError } from '@/lib/api/common';

export async function logError(error: ApiError, req?: { ip?: string; ua?: string }) {
  await logUserAction({
    action: 'API_ERROR',
    status: 'FAILURE',
    severity: 'error',
    ipAddress: req?.ip ?? null,
    userAgent: req?.ua ?? null,
    targetResourceType: 'api',
    targetResourceId: '',
    details: { code: error.code, message: error.message }
  });
}
