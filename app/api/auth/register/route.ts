import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { logUserAction } from '@/lib/audit/auditLogger';

// Zod schema for registration data (matches original)
const RegistrationSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
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
    // 1. Rate Limiting
    const isRateLimited = await checkRateLimit(request);
    if (isRateLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Parse and Validate Body
    const parseResult = RegistrationSchema.safeParse(body);

    if (!parseResult.success) {
      emailForLogging = body?.email; // Attempt to get email for logging
      const errors = parseResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { email, password, firstName, lastName } = parseResult.data;
    emailForLogging = email; // Store email for logging
    const supabaseService = getServiceSupabase();

    // 3. Call Supabase Auth signUp (using Service Client)
    // Note: Using service client for signUp might bypass email verification flow depending on Supabase settings.
    // If email verification MUST happen, signUp might need to be called client-side, 
    // OR use admin.createUser which doesn't send verification, requiring a separate send.
    // Let's assume service client signUp works as intended for now.
    const { data, error: signUpError } = await supabaseService.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          // Add role if applicable, e.g., role: 'user' 
          // Ensure 'role' exists in your user metadata schema in Supabase
        },
        // Use environment variable for redirect URL, default to typical local dev setup
        emailRedirectTo: process.env.NEXT_PUBLIC_VERIFICATION_REDIRECT_URL || `${request.nextUrl.origin}/verify-email`,
      }
    });

    // 4. Handle Supabase Errors
    if (signUpError) {
      console.error('Supabase registration error:', signUpError);
      
      // Log the failed registration attempt using the service client
      await logUserAction({
          client: supabaseService, // Pass service client
          action: 'REGISTER_FAILURE',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          targetResourceId: email, // Log the email attempted
          details: { 
              reason: signUpError.message, 
              code: signUpError.code, 
              status: signUpError.status 
          }
      });

      // Check status code and message content
      if (signUpError.status === 409 || (signUpError.status === 400 && signUpError.message.includes('User already registered'))) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      // Add specific checks for weak password etc. if needed based on Supabase response
      
      // Generic error
      return NextResponse.json({ error: signUpError.message || 'Registration failed.' }, { status: signUpError.status || 400 });
    }

    // 5. Handle Success
    if (!data.user) {
      // Log this unexpected success state using the service client
      await logUserAction({
          client: supabaseService, // Pass service client
          action: 'REGISTER_UNEXPECTED_NO_USER',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          targetResourceId: email, 
          details: { message: 'Registration successful but no user data returned' }
      });
      console.error('Registration successful but no user data returned');
      return NextResponse.json({ error: 'Registration failed unexpectedly.' }, { status: 500 });
    }

    // Log successful registration using the service client
    await logUserAction({
        client: supabaseService, // Pass service client
        userId: data.user.id,
        action: 'REGISTER_SUCCESS',
        status: 'SUCCESS',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'auth',
        targetResourceId: data.user.id,
        details: { email: data.user.email } // Log email as detail
    });

    // Return success message and user data (without session if verification is needed)
    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: data.user, 
    }); // Default 200 OK
  } catch (error) {
    // 6. Handle Unexpected Errors
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Log the unexpected error using the service client if available, otherwise default
    // Note: supabaseService might not be initialized if error happened before its creation
    // We need a way to get the service client here reliably if possible
    // For now, let's assume we might not have it and let it use the default anon client
    // OR explicitly try to get it again (might fail if env vars missing)
    try {
      const serviceClientForCatch = getServiceSupabase(); // Try getting it again
      await logUserAction({
          client: serviceClientForCatch, // Pass service client
          action: 'REGISTER_UNEXPECTED_ERROR',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          targetResourceId: emailForLogging, // Use stored email if available
          details: { error: message }
      });
    } catch (logError) {
        console.error('Failed to log unexpected registration error using service client:', logError);
        // Fallback logging attempt potentially without service client if needed
    }

    return NextResponse.json({ error: 'Registration failed. Please try again.', details: message }, { status: 500 });
  }
}

// Apply rate limiting and security middleware
export const POST = withSecurity(
  async (request: NextRequest) => withAuthRateLimit(request, handler)
); 