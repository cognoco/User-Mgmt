import { ApiError } from '@/lib/api/common/apiError';
import { logUserAction } from '@/src/lib/audit/auditLogger';

export type ErrorSeverity = 'INFO' | 'WARN' | 'ERROR';

function getSeverity(status: number): ErrorSeverity {
  if (status >= 500) return 'ERROR';
  if (status >= 400) return 'WARN';
  return 'INFO';
}

interface ErrorContext {
  ipAddress?: string;
  userAgent?: string;
  path?: string;
}

export async function logApiError(error: ApiError | Error, context: ErrorContext) {
  const apiError = error instanceof ApiError ? error : new ApiError('SERVER_GENERAL_001', error.message || 'Unknown error', 500);
  const severity = getSeverity(apiError.status);
  try {
    await logUserAction({
      action: 'API_ERROR',
      status: 'FAILURE',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      targetResourceType: 'api',
      targetResourceId: context.path,
      details: { code: apiError.code, message: apiError.message, severity },
    });
  } catch (err) {
    console.error('Failed to log API error:', err);
  }
}
