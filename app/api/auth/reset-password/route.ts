import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getApiAuthService } from '@/lib/api/auth/factory';

// Zod schema for password reset request
const ResetRequestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

async function handler(request: NextRequest): Promise<NextResponse> {
  // Get IP and User Agent early
  const ipAddress = request.ip;
  const userAgent = request.headers.get('user-agent');
  let emailForLogging: string | null = null; // Variable to hold email for logging

  if (request.method !== 'POST') {
    return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    
    // Validate request body
    const parseResult = ResetRequestSchema.safeParse(body);
    if (!parseResult.success) {
      emailForLogging = body?.email;
      const errors = parseResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { email } = parseResult.data;
    emailForLogging = email; // Store for logging
    
    // Get AuthService and call resetPassword method
    const authService = getApiAuthService();
    
    // Send password reset email using the AuthService
    const resetResult = await authService.resetPassword(email);

    // Log the attempt regardless of result, due to email enumeration prevention
    await logUserAction({
        action: 'PASSWORD_RESET_REQUEST',
        status: resetResult.success ? 'INITIATED' : 'FAILURE',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'auth',
        targetResourceId: email, // Log the email attempted
        details: { 
            error: resetResult.error || null
        }
    });

    if (!resetResult.success) {
      // Logged above, now just return standard response
      console.error('Password reset error (will still return generic success):', resetResult.error);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive password reset instructions.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Log the unexpected error
    await logUserAction({
        action: 'PASSWORD_RESET_UNEXPECTED_ERROR',
        status: 'FAILURE',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'auth',
        targetResourceId: emailForLogging, // Use stored email if available
        details: { error: message }
    });

    // Use generic message to prevent email enumeration even on unexpected errors
    return NextResponse.json(
      { message: 'If an account exists with this email, you will receive password reset instructions.' },
      { status: 200 } // Return 200 OK
    );
  }
}

// Apply rate limiting and security middleware
export const POST = withSecurity(
  async (request: NextRequest) => withAuthRateLimit(request, handler)
); 