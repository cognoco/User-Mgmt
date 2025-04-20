import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod'; // Import Zod
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';

// Zod schema for the request body
const ResendEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address provided.' }),
});

export async function POST(request: NextRequest) {
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

    // 3. Call Supabase Auth Resend
    const supabaseService = getServiceSupabase();
    const redirectUrl = process.env.NEXT_PUBLIC_VERIFICATION_REDIRECT_URL || `${request.nextUrl.origin}/verify-email`;
    
    const { error: resendError } = await supabaseService.auth.resend({
      type: 'signup',
      email: email, // Use email from request body
      options: {
        emailRedirectTo: redirectUrl, 
      }
    });

    // 4. Handle Errors
    if (resendError) {
      console.error('Supabase verification email resend error:', resendError);
      // Consider specific errors like rate limits from Supabase
      // Avoid leaking user existence info here if possible, but log the error server-side.
      // Maybe return a generic error message to the client regardless of the specific Supabase error?
      // For now, we return the Supabase error, but consider security implications.
      return NextResponse.json({ error: resendError.message || 'Failed to send verification email.' }, { status: resendError.status || 400 });
    }

    // 5. Handle Success
    return NextResponse.json({ 
      message: 'If an account exists with this email, a verification email has been sent.' // Generic success message
    }); // 200 OK
    
  } catch (error) {
    // 6. Handle Unexpected Errors
    console.error('Unexpected send verification email API error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'An internal server error occurred.', details: message }, { status: 500 });
  }
} 