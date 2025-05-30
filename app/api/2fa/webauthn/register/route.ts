import { NextRequest, NextResponse } from 'next/server';
import { generateRegistration, verifyRegistration } from '@/lib/webauthn/webauthn.service';
import { logUserAction } from '@/lib/audit/auditLogger';
import { withSecurity } from '@/middleware/with-security';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware
} from '@/middleware/createMiddlewareChain';
import { z } from 'zod';

// Schema for registration request
const registerRequestSchema = z.object({
  phase: z.enum(['options', 'verification']),
  credential: z.any().optional(),
});

async function handleRegister(
  request: NextRequest,
  auth: any,
  data: z.infer<typeof registerRequestSchema>
) {
  const userId = auth.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    if (data.phase === 'options') {
      const options = await generateRegistration(userId);

      await logUserAction({
        userId,
        action: 'WEBAUTHN_REGISTRATION_INITIATED',
        status: 'INITIATED',
        ipAddress,
        userAgent,
        targetResourceType: 'auth_method',
        targetResourceId: userId
      });

      return NextResponse.json(options);
    } else {
      // Verify registration
      if (!data.credential) {
        return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
      }

      const verification = await verifyRegistration(userId, data.credential);

      await logUserAction({
        userId,
        action: 'WEBAUTHN_REGISTRATION_COMPLETED',
        status: 'SUCCESS',
        ipAddress,
        userAgent,
        targetResourceType: 'auth_method',
        targetResourceId: userId
      });

      return NextResponse.json(verification);
    }
  } catch (error) {
    console.error('WebAuthn registration error:', error);

    await logUserAction({
      userId,
      action: 'WEBAUTHN_REGISTRATION_FAILED',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth_method',
      targetResourceId: userId,
      details: { error: error instanceof Error ? error.message : String(error) }
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 400 }
    );
  }
}

const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(registerRequestSchema)
]);

export const POST = withSecurity((request: NextRequest) =>
  middleware(handleRegister)(request));
