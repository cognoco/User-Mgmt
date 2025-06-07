import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { logUserAction } from '@/lib/audit/auditLogger';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';

const MagicLinkSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

/**
 * POST handler for passwordless authentication (magic link) endpoint
 */
export const POST = createApiHandler(
  MagicLinkSchema,
  async (request, _authContext, data, services) => {
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await services.auth.sendMagicLink(data.email);

    await logUserAction({
      action: 'MAGIC_LINK_REQUEST',
      status: result.success ? 'SUCCESS' : 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      targetResourceId: data.email,
      details: { error: result.error || null },
    });

    if (!result.success) {
      throw new ApiError(ERROR_CODES.INTERNAL_ERROR, result.error || 'Failed to send magic link', 500);
    }

    return createSuccessResponse({ 
      message: 'If an account exists with this email, a login link has been sent.' 
    });
  },
  { 
    requireAuth: false, // Passwordless auth doesn't require existing auth
    rateLimit: { windowMs: 15 * 60 * 1000, max: 5 } // Strict rate limiting for magic links
  }
);
