import { NextResponse } from 'next/server';
import { z } from 'zod';
import { TwoFactorMethod } from '@/types/2fa';
import { getApiAuthService } from '@/services/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import { withAuthRateLimit } from '@/middleware/rate-limit';
import { withSecurity } from '@/middleware/with-security';

// Request schema for MFA check after initial login
const mfaCheckSchema = z.object({
  accessToken: z.string(), // Temporary access token from initial login
  preferredMethod: z.nativeEnum(TwoFactorMethod).optional(), // Optional preferred MFA method
});

async function handler(request: Request) {
  // Get IP and User Agent early for logging
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const { accessToken, preferredMethod } = mfaCheckSchema.parse(body);

    // Get AuthService
    const authService = getApiAuthService();
    
    // Check MFA requirements and send verification code if needed
    const result = await authService.checkMfaRequirements({
      accessToken,
      preferredMethod
    });
    
    // Log the MFA check
    await logUserAction({
      action: 'MFA_CHECK',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      details: { 
        mfaRequired: result.mfaRequired,
        selectedMethod: result.selectedMethod
      }
    });
    
    // If there was an error, return it
    if (!result.success) {
      console.error('MFA check failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'MFA check failed' },
        { status: 400 }
      );
    }

    // Return MFA check response
    return NextResponse.json({
      mfaRequired: result.mfaRequired,
      availableMethods: result.availableMethods || [],
      selectedMethod: result.selectedMethod,
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    console.error('Error in MFA check:', error);
    
    // Log the error
    await logUserAction({
      action: 'MFA_CHECK_ERROR',
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