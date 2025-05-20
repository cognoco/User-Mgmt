import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/middleware/rate-limit';
import { getApiAuthService } from '@/lib/api/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';

// Zod schema for the request body
const ResendEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address provided.' }),
});

export async function POST(request: NextRequest) {
  // Get IP and User Agent early for logging
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Get Email from Request Body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate request body
    const parseResult = ResendEmailSchema.safeParse(requestBody);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { email } = parseResult.data;
    console.log(`Verification email resend request for email: ${email}`);

    // 3. Get AuthService and call sendVerificationEmail method
    const authService = getApiAuthService();
    const result = await authService.sendVerificationEmail(email);
    
    // Log the attempt
    await logUserAction({
      action: 'VERIFICATION_EMAIL_REQUEST',
      status: result.success ? 'SUCCESS' : 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      targetResourceId: email,
      details: { 
        error: result.error || null
      }
    });

    // 4. Handle Errors
    if (!result.success) {
      console.error('Verification email resend error:', result.error);
      // For security reasons, we don't want to leak information about whether an email exists
      // So we'll return a generic success message even in case of error
    }

    // 5. Handle Success - always return the same message for security (prevent email enumeration)
    return NextResponse.json({ 
      message: 'If an account exists with this email, a verification email has been sent.' // Generic success message
    }); // 200 OK
    
  } catch (error) {
    // 6. Handle Unexpected Errors
    console.error('Unexpected send verification email API error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Log the error
    await logUserAction({
      action: 'VERIFICATION_EMAIL_UNEXPECTED_ERROR',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      details: { error: message }
    });
    
    // For security reasons, still return the generic success message
    return NextResponse.json({ 
      message: 'If an account exists with this email, a verification email has been sent.'
    }, { status: 200 });
  }
}