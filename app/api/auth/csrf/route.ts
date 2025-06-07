import { z } from 'zod';
import { getCSRFToken } from '@/middleware/csrf';
import { logUserAction } from '@/lib/audit/auditLogger';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';
import { createApiHandler } from '@/lib/api/routeHelpers'227;

const emptySchema = z.object({});

export const GET = createApiHandler(
  emptySchema,
  async (request, _authContext, _data) => {
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      const token = getCSRFToken(request as any);

      await logUserAction({
        action: 'CSRF_TOKEN_GENERATED',
        status: 'SUCCESS',
        ipAddress,
        userAgent,
        targetResourceType: 'security'
      });

      return createSuccessResponse({ token });
    } catch (error: any) {
      await logUserAction({
        action: 'CSRF_TOKEN_ERROR',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        targetResourceType: 'security',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      throw new ApiError(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to generate CSRF token',
        500
      );
    }
  },
  {
    requireAuth: false,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 60 }
  }
);
