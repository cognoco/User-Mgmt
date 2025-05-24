import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import {
  createSuccessResponse,
  withErrorHandling,
  withValidation,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';

const DeleteAccountSchema = z.object({ password: z.string().min(1) });

async function handleDeleteAccount(
  req: NextRequest,
  data: z.infer<typeof DeleteAccountSchema>
) {
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  try {
    const authService = getApiAuthService();
    await authService.deleteAccount(data.password);
    await logUserAction({
      action: 'ACCOUNT_DELETED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'auth'
    });
    return createSuccessResponse({ message: 'Account successfully deleted' });
  } catch (error) {
    await logUserAction({
      action: 'ACCOUNT_DELETE_FAILED',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      details: { error: error instanceof Error ? error.message : String(error) }
    });
    throw new ApiError(
      ERROR_CODES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Account deletion failed',
      500
    );
  }
}

async function handler(req: NextRequest) {
  return withErrorHandling(
    async (r) => withValidation(DeleteAccountSchema, handleDeleteAccount, r),
    req
  );
}

export const DELETE = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler)
);
