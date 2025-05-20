import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getApiAuthService } from '@/lib/api/auth/factory';
import { LoginPayload } from '@/core/auth/models';

// Zod schema for login data (matches original)
const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(), 
});

export async function POST(request: NextRequest) {
  // Get IP and User Agent early
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let emailForLogging: string | null = null; // Variable to hold email for logging in case of errors

  try {
    // 2. Parse and Validate Body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const parseResult = LoginSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
      }));
      emailForLogging = body.email; // Store email for potential error logging
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }
    // ---- End of Validation ---- 

    const { email, password, rememberMe } = parseResult.data;
    emailForLogging = email; // Store email for potential error logging
    
    // 3. Get AuthService and call login method
    const authService = getApiAuthService();
    const loginPayload: LoginPayload = {
      email,
      password,
      rememberMe: rememberMe || false
    };
    
    const authResult = await authService.login(loginPayload);

    // 4. Handle Login Errors
    if (!authResult.success) {
      console.error('Login error:', authResult.error);
      
      // Log the failed login attempt
      await logUserAction({
          action: 'LOGIN_FAILURE',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          targetResourceId: email, // Log the email attempted
          details: { 
              reason: authResult.error
          }
      });

      // Handle specific error cases
      if (authResult.error?.includes('Invalid login credentials')) {
         return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      } 
      if (authResult.error?.includes('Email not confirmed')) {
         return NextResponse.json({ 
            error: 'Email address not verified.', 
            code: 'EMAIL_NOT_VERIFIED' 
         }, { status: 403 });
      }
      
      // Generic authentication failure
      return NextResponse.json({ error: authResult.error || 'Authentication failed.' }, { status: 401 });
    }

    // 5. Handle Success
    if (!authResult.user) {
        console.error('Login successful but no user returned');
        return NextResponse.json({ error: 'Login failed unexpectedly after authentication.' }, { status: 500 });
    }

    // Check if user has MFA enabled
    const hasMfaEnabled = authResult.user.mfaEnabled;
    
    // Log successful login
    await logUserAction({
        userId: authResult.user.id,
        action: 'LOGIN_SUCCESS',
        status: 'SUCCESS',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'auth',
        targetResourceId: authResult.user.id,
        details: { requiresMfa: hasMfaEnabled }
    });

    // Include MFA status in response
    console.log('Login successful for:', email, rememberMe ? '(with extended session)' : '');
    return NextResponse.json({
      user: authResult.user,
      token: authResult.token,
      requiresMfa: hasMfaEnabled,
      expiresAt: authResult.expiresAt
    }); 
    
  } catch (error) {
    // 6. Handle Unexpected Errors
    console.error('Unexpected Login API error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Log the unexpected error
    await logUserAction({
        action: 'LOGIN_UNEXPECTED_ERROR',
        status: 'FAILURE',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'auth',
        targetResourceId: emailForLogging, // Use the stored email if available
        details: { error: message }
    });

    return NextResponse.json({ error: 'An internal server error occurred during login.', details: message }, { status: 500 });
  }
}