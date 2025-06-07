import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { logUserAction } from '@/lib/audit/auditLogger';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';

// Request schema for resending email during login
const resendEmailSchema = z.object({
  accessToken: z.string(), // Temporary access token from initial login
});

/**
 * POST handler for MFA email resend endpoint
 */
export const POST = createApiHandler(
  resendEmailSchema,
  async (request, _authContext, data, services) => {
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    try {
      const { accessToken } = data;
      
      // Resend MFA email code using the AuthService
      const result = await services.auth.resendMfaEmailCode(accessToken);
      
      // Log the attempt
      await logUserAction({
        action: 'MFA_EMAIL_RESEND',
        status: result.success ? 'SUCCESS' : 'FAILURE',
        ipAddress,
        userAgent,
        targetResourceType: 'auth',
        details: { 
          error: result.error || null
        }
      });
      
      // Handle failure
      if (!result.success) {
        console.error('Failed to resend MFA email code:', result.error);
        throw new ApiError(
          ERROR_CODES.INVALID_REQUEST,
          result.error || 'Failed to resend verification email',
          400
        );
      }

      return createSuccessResponse({
        success: true,
        message: 'Verification code sent successfully',
        testid: 'email-mfa-resend-success'
      });
    } catch (error) {
      console.error('Error in resend-email route:', error);
      
      // Log the error
      await logUserAction({
        action: 'MFA_EMAIL_RESEND_ERROR',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        targetResourceType: 'auth',
        details: { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
      });
      
      throw new ApiError(
        ERROR_CODES.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500
      );
    }
  },
  { 
    requireAuth: false, // MFA resend doesn't require full auth
    rateLimit: { windowMs: 15 * 60 * 1000, max: 5 }
  }
);