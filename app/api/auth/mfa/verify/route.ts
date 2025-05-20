import { NextResponse } from 'next/server';
import { z } from 'zod';
import { TwoFactorMethod } from '@/types/2fa';
import { getApiAuthService } from '@/lib/api/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import { withAuthRateLimit } from '@/middleware/rate-limit';
import { withSecurity } from '@/middleware/security';

// Request schema for MFA verification
const mfaVerifySchema = z.object({
  code: z.string().min(6).max(8),
  method: z.nativeEnum(TwoFactorMethod).default(TwoFactorMethod.TOTP),
  accessToken: z.string(), // Temporary access token from initial login
  rememberDevice: z.boolean().optional(),
});

async function handler(request: Request) {
  // Get IP and User Agent early for logging
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const { code, method, accessToken, rememberDevice } = mfaVerifySchema.parse(body);

    // Get AuthService
    const authService = getApiAuthService();
    
    // Verify MFA code using the AuthService
    const verifyResult = await authService.verifyMfaCode({
      code,
      method,
      accessToken,
      rememberDevice: rememberDevice || false
    });
    
    // Log the MFA verification attempt
    await logUserAction({
      action: 'MFA_VERIFICATION_ATTEMPT',
      status: verifyResult.success ? 'SUCCESS' : 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      details: {
        method,
        error: verifyResult.error || null
      }
    });
    
    // Handle verification failure
    if (!verifyResult.success) {
      console.error('MFA verification failed:', verifyResult.error);
      return NextResponse.json(
        { error: verifyResult.error || 'MFA verification failed' },
        { status: 400 }
      );
    }
    
    // Get user from result
    const { user } = verifyResult;

    // Get session from result
    const { session } = verifyResult;

    // Return full authenticated session
    return NextResponse.json({
      user,
      token: session.access_token,
      expiresAt: session.expires_at,
      rememberDevice: !!rememberDevice
    });
  } catch (error) {
    console.error('Error in MFA verification:', error);
    
    // Log the error
    await logUserAction({
      action: 'MFA_VERIFICATION_ERROR',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      details: { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
    });
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Apply rate limiting and security middleware
export const POST = withSecurity(
  async (request: Request) => withAuthRateLimit(request, handler)
);