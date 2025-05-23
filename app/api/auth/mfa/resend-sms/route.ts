import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiAuthService } from '@/services/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import { withAuthRateLimit } from '@/middleware/rate-limit';
import { withSecurity } from '@/middleware/security';

// Request schema for resending SMS during login
const resendSmsSchema = z.object({
  accessToken: z.string(), // Temporary access token from initial login
});

async function handler(request: Request) {
  // Get IP and User Agent early for logging
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const { accessToken } = resendSmsSchema.parse(body);

    // Get AuthService
    const authService = getApiAuthService();
    
    // Resend MFA SMS code using the AuthService
    const result = await authService.resendMfaSmsCode(accessToken);
    
    // Log the attempt
    await logUserAction({
      action: 'MFA_SMS_RESEND',
      status: result.success ? 'SUCCESS' : 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      details: { 
        error: result.error || null
      }
    });
    
    // Handle failure
    if (!result.success) {
      console.error('Failed to resend MFA SMS code:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to resend verification SMS' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      testid: 'sms-mfa-resend-success'
    });
  } catch (error) {
    console.error('Error in resend-sms route:', error);
    
    // Log the error
    await logUserAction({
      action: 'MFA_SMS_RESEND_ERROR',
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