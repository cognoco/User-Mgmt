import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase'; // Corrected import path
import { checkRateLimit } from '@/middleware/rate-limit'; // Corrected import path
import { logUserAction } from '@/lib/audit/auditLogger'; // Added audit logger import
// Removed SupabaseAuthError import

// Zod schema for login data (matches original)
const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(), 
});

export async function POST(request: NextRequest) {
  // Get IP and User Agent early
  const ipAddress = request.ip;
  const userAgent = request.headers.get('user-agent');

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
    const supabaseService = getServiceSupabase();

    // 3. Call Supabase Auth (using Service Client)
    const { data, error: signInError } = await supabaseService.auth.signInWithPassword({
      email,
      password,
    });

    // 4. Handle Supabase Errors
    if (signInError) {
      console.error('Supabase login error:', signInError.message, 'Status:', signInError.status);
      
      // Log the failed login attempt
      await logUserAction({
          action: 'LOGIN_FAILURE',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          targetResourceId: email, // Log the email attempted
          details: { 
              reason: signInError.message, 
              code: signInError.code, // Include Supabase error code if available
              status: signInError.status 
          }
      });

      // Check status code and message content
      if (signInError.status === 400 && signInError.message.includes('Invalid login credentials')) {
         return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 }); // Return 401 for invalid creds
      } 
      if (signInError.status === 400 && signInError.message.includes('Email not confirmed')) {
         return NextResponse.json({ 
            error: 'Email address not verified.', 
            code: 'EMAIL_NOT_VERIFIED' 
         }, { status: 403 });
      }
      // Add other specific error checks if needed
      
      // Generic authentication failure
      return NextResponse.json({ error: signInError.message || 'Authentication failed.' }, { status: signInError.status || 401 });
    }

    // 5. Handle Success
    if (!data.session || !data.user) {
        console.error('Login successful but no session/user returned');
        return NextResponse.json({ error: 'Login failed unexpectedly after authentication.' }, { status: 500 });
    }

    // If rememberMe is true, extend the session
    if (rememberMe && data.session) {
      try {
        // Create a new session with longer expiry
        const { data: extendedSession, error: refreshError } = await supabaseService.auth.setSession({
          refresh_token: data.session.refresh_token!,
          access_token: data.session.access_token
        });
        
        if (refreshError) {
          console.error('Failed to extend session:', refreshError);
        } else if (extendedSession && extendedSession.session) {
          // Use the extended session data instead
          data.session = extendedSession.session;
        }
      } catch (sessionError) {
        console.error('Error extending session:', sessionError);
      }
    }

    // Check if user has MFA enabled
    const hasMfaEnabled = data.user.user_metadata?.totpEnabled === true;
    
    // Log successful login
    await logUserAction({
        userId: data.user.id,
        action: 'LOGIN_SUCCESS',
        status: 'SUCCESS',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'auth',
        targetResourceId: data.user.id,
        details: { requiresMfa: hasMfaEnabled }
    });

    // Include MFA status in response
    console.log('Login successful for:', email, rememberMe ? '(with extended session)' : '');
    return NextResponse.json({
      user: data.user,
      token: data.session.access_token,
      requiresMfa: hasMfaEnabled,
      expiresAt: data.session.expires_at
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