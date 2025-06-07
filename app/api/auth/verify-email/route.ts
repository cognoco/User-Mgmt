import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { logUserAction } from '@/lib/audit/auditLogger';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';

const VerifyEmailSchema = z.object({ token: z.string().min(1) });

/**
 * POST handler for email verification endpoint
 */
export const POST = createApiHandler(
  VerifyEmailSchema,
  async (request, _authContext, data, services) => {
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    try {
      await services.auth.verifyEmail(data.token);
      
      await logUserAction({
        action: 'EMAIL_VERIFIED',
        status: 'SUCCESS',
        ipAddress,
        userAgent,
        targetResourceType: 'auth'
      });
      
      return createSuccessResponse({ message: 'Email verified successfully' });
    } catch (error) {
      await logUserAction({
        action: 'EMAIL_VERIFICATION_FAILED',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        targetResourceType: 'auth',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
      
      throw new ApiError(
        ERROR_CODES.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Verification failed',
        500
      );
    }
  },
  { 
    requireAuth: false, // Email verification doesn't require auth
    rateLimit: { windowMs: 15 * 60 * 1000, max: 30 }
  }
);
