import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { getApiAuthService } from '@/services/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';

const MagicLinkSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

async function handleMagicLink(
  req: NextRequest,
  data: z.infer<typeof MagicLinkSchema>,
) {
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  const authService = getApiAuthService();
  const result = await authService.sendMagicLink(data.email);

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

  return createSuccessResponse({ message: 'If an account exists with this email, a login link has been sent.' });
}

async function handler(req: NextRequest) {
  return withErrorHandling(
    async (r) => withValidation(MagicLinkSchema, handleMagicLink, r),
    req,
  );
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler),
);
