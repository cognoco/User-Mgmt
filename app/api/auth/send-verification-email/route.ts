import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/middleware/rate-limit';
import { getApiAuthService } from '@/lib/api/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import {
  createSuccessResponse,
  withErrorHandling,
  withValidation,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';

// Zod schema for the request body
const ResendEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address provided.' }),
});

async function handleSendVerificationEmail(
  req: NextRequest,
  validatedData: z.infer<typeof ResendEmailSchema>
) {
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const { email } = validatedData;

  // Rate limiting
  const isRateLimited = await checkRateLimit(req);
  if (isRateLimited) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Too many requests', 429);
  }

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

export async function POST(request: NextRequest) {
  return withErrorHandling(
    async (req) => withValidation(ResendEmailSchema, handleSendVerificationEmail, req),
    request
  );
}