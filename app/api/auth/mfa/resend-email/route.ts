import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request schema for resending email during login
const resendEmailSchema = z.object({
  accessToken: z.string(), // Temporary access token from initial login
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { accessToken } = resendEmailSchema.parse(body);

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Set the access token from initial login to get the user
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '', // We don't have a refresh token yet
    });

    if (setSessionError) {
      console.error('Failed to set temporary session:', setSessionError);
      return NextResponse.json(
        { error: 'Authentication failed. Please log in again.' },
        { status: 401 }
      );
    }

    // Get the user
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError || !user) {
      console.error('Failed to get user:', getUserError);
      return NextResponse.json(
        { error: 'Authentication failed. Please log in again.' },
        { status: 401 }
      );
    }

    // Verify the user has Email MFA enabled
    if (!user.user_metadata?.mfaEmailVerified) {
      return NextResponse.json(
        { error: 'Email MFA is not enabled for this account.' },
        { status: 400 }
      );
    }

    // Get the email from user metadata or use the main account email
    const email = user.user_metadata?.mfaEmail || user.email;
    if (!email) {
      return NextResponse.json(
        { error: 'No email found for Email MFA verification.' },
        { status: 400 }
      );
    }

    // Generate a new 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

    // Send Email
    try {
      const { sendEmail } = await import('@/lib/email/sendEmail');
      await sendEmail({
        to: email,
        subject: 'Your MFA Verification Code',
        html: `<p>Your verification code is: <b>${code}</b></p><p>If you did not request this code, please ignore this email and secure your account.</p>`
      });
    } catch (err) {
      console.error('Failed to send email:', err);
      return NextResponse.json(
        { error: 'Failed to send verification email.' },
        { status: 500 }
      );
    }

    // Store the code and expiry in user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        mfaLoginEmailCode: code,
        mfaLoginEmailCodeExpiresAt: expiresAt,
      },
    });

    if (updateError) {
      console.error('Failed to update user metadata:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      testid: 'email-mfa-resend-success'
    });
  } catch (error) {
    console.error('Error in resend-email route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 