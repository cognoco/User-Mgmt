import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { logUserAction } from '@/lib/audit/auditLogger';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';

const DeleteAccountSchema = z.object({ password: z.string().min(1) });

/**
 * DELETE handler for account deletion endpoint
 */
export const DELETE = createApiHandler(
  DeleteAccountSchema,
  async (request, authContext, data, services) => {
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    try {
      await services.auth.deleteAccount(data.password);
      
      await logUserAction({
        userId: authContext.userId,
        action: 'ACCOUNT_DELETED',
        status: 'SUCCESS',
        ipAddress,
        userAgent,
        targetResourceType: 'auth',
        targetResourceId: authContext.userId
      });
      
      return createSuccessResponse({ message: 'Account successfully deleted' });
    } catch (error) {
      await logUserAction({
        userId: authContext.userId,
        action: 'ACCOUNT_DELETE_FAILED',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        targetResourceType: 'auth',
        targetResourceId: authContext.userId,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
      
      throw new ApiError(
        ERROR_CODES.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Account deletion failed',
        500
      );
    }
  },
  { 
    requireAuth: true, // Account deletion requires authentication
    rateLimit: { windowMs: 15 * 60 * 1000, max: 3 } // Very strict rate limiting for account deletion
  }
);
