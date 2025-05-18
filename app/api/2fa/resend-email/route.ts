import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  try {
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

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the email from user metadata or use user's primary email
    let email = user.user_metadata?.mfaEmail;
    if (!email) {
      email = user.email;
    }
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required for Email MFA' },
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
        html: `<p>Your verification code is: <b>${code}</b></p>`
      });
    } catch (err) {
      console.error('Failed to send email:', err);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    // Update user metadata with new code and expiry
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        mfaEmailCode: code,
        mfaEmailCodeExpiresAt: expiresAt,
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
  } catch (error: any) {
    console.error('Error in resend-email route:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 