import { NextRequest, NextResponse } from 'next/server';
import { generateAuthentication, verifyAuthentication } from '@/lib/webauthn/webauthn.service';
import { logUserAction } from '@/lib/audit/auditLogger';
import { withSecurity } from '@/middleware/with-security';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  validationMiddleware
} from '@/middleware/createMiddlewareChain';
import { z } from 'zod';

// Schema for verification request
const verifyRequestSchema = z.object({
  phase: z.enum(['options', 'verification']),
  credential: z.any().optional(),
  userId: z.string(),
});

async function handleVerify(
  request: NextRequest,
  _auth: any,
  data: z.infer<typeof verifyRequestSchema>
) {
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const userId = data.userId;

  try {
    if (data.phase === 'options') {
      const options = await generateAuthentication(userId);

      await logUserAction({
        action: 'WEBAUTHN_VERIFICATION_INITIATED',
        status: 'INITIATED',
        ipAddress,
        userAgent,
        targetResourceType: 'auth_method',
        targetResourceId: userId
      });

      return NextResponse.json(options);
    } else {
      // Verify authentication
      if (!data.credential) {
        return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
      }

      const verification = await verifyAuthentication(userId, data.credential);

      if (verification.verified) {
        await logUserAction({
          action: 'WEBAUTHN_VERIFICATION_COMPLETED',
          status: 'SUCCESS',
          ipAddress,
          userAgent,
          targetResourceType: 'auth_method',
          targetResourceId: userId
        });

        return NextResponse.json({
          verified: true,
          user: { id: userId }
        });
      } else {
        throw new Error('Verification failed');
      }
    }
  } catch (error) {
    console.error('WebAuthn verification error:', error);

    await logUserAction({
      action: 'WEBAUTHN_VERIFICATION_FAILED',
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
  validationMiddleware(verifyRequestSchema)
]);

// Note: Not using auth middleware because this can be called during login
export const POST = withSecurity((request: NextRequest) =>
  middleware(handleVerify)(request));
