import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request schema for resending SMS during login
const resendSmsSchema = z.object({
  accessToken: z.string(), // Temporary access token from initial login
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { accessToken } = resendSmsSchema.parse(body);

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

    // Verify the user has SMS MFA enabled
    if (!user.user_metadata?.mfaSmsVerified) {
      return NextResponse.json(
        { error: 'SMS MFA is not enabled for this account.' },
        { status: 400 }
      );
    }

    // Get the phone number from user metadata
    const phone = user.user_metadata?.mfaPhone;
    if (!phone) {
      return NextResponse.json(
        { error: 'No phone number found for SMS verification.' },
        { status: 400 }
      );
    }

    // Generate a new 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

    // Send SMS
    try {
      const { sendSms } = await import('@/lib/sms/sendSms');
      await sendSms({
        to: phone,
        message: `Your verification code is: ${code}`
      });
    } catch (err) {
      console.error('Failed to send SMS:', err);
      return NextResponse.json(
        { error: 'Failed to send verification SMS.' },
        { status: 500 }
      );
    }

    // Store the code and expiry in user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        mfaLoginSmsCode: code,
        mfaLoginSmsCodeExpiresAt: expiresAt,
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
      testid: 'sms-mfa-resend-success'
    });
  } catch (error) {
    console.error('Error in resend-sms route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 