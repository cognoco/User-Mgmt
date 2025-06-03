import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { getApiAuthService } from '@/services/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  validationMiddleware,
  rateLimitMiddleware
} from '@/middleware/createMiddlewareChain';

// Zod schema for the request body
const ResendEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address provided.' }),
});

async function handleSendVerificationEmail(
  req: NextRequest,
  ctx?: any,
  validatedData?: z.infer<typeof ResendEmailSchema>
) {
  if (!validatedData) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      'Invalid or missing request data',
      400
    );
  }

  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const { email } = validatedData;

  const authService = getApiAuthService();
  const result = await authService.sendVerificationEmail(email);

  await logUserAction({
    action: 'VERIFICATION_EMAIL_REQUEST',
    status: result.success ? 'SUCCESS' : 'FAILURE',
    ipAddress,
    userAgent,
    targetResourceType: 'auth',
    targetResourceId: email,
    details: { error: result.error || null }
  });

  if (!result.success) {
    console.error('Verification email resend error:', result.error);
  }

  return createSuccessResponse({
    message:
      'If an account exists with this email, a verification email has been sent.'
  });
}

const middleware = createMiddlewareChain([
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }),
  errorHandlingMiddleware(),
  validationMiddleware(ResendEmailSchema)
]);

export const POST = (request: NextRequest) =>
  middleware(handleSendVerificationEmail)(request);