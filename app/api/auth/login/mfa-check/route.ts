import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { TwoFactorMethod } from '@/types/2fa';

// Request schema for MFA check after initial login
const mfaCheckSchema = z.object({
  accessToken: z.string(), // Temporary access token from initial login
  preferredMethod: z.nativeEnum(TwoFactorMethod).optional(), // Optional preferred MFA method
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { accessToken, preferredMethod } = mfaCheckSchema.parse(body);

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

    // Check if MFA is enabled for this user
    // Get available MFA methods from user metadata
    const mfaMethods = Array.isArray(user.user_metadata?.mfaMethods) 
      ? user.user_metadata.mfaMethods
      : [];
    
    // Add methods based on older metadata structure for backward compatibility
    if (user.user_metadata?.totpEnabled && !mfaMethods.includes(TwoFactorMethod.TOTP)) {
      mfaMethods.push(TwoFactorMethod.TOTP);
    }
    if (user.user_metadata?.mfaSmsVerified && !mfaMethods.includes(TwoFactorMethod.SMS)) {
      mfaMethods.push(TwoFactorMethod.SMS);
    }
    if (user.user_metadata?.mfaEmailVerified && !mfaMethods.includes(TwoFactorMethod.EMAIL)) {
      mfaMethods.push(TwoFactorMethod.EMAIL);
    }

    // Check if user has any MFA methods enabled
    if (mfaMethods.length === 0) {
      // No MFA methods enabled, proceed with login
      return NextResponse.json({
        mfaRequired: false,
        session: accessToken,
        user
      });
    }

    // Get the user's preferred MFA method or select the first available
    const availableMethods = Array.from(new Set(mfaMethods));
    
    // If preferred method is specified and available, use it
    let selectedMethod: TwoFactorMethod;
    if (preferredMethod && availableMethods.includes(preferredMethod)) {
      selectedMethod = preferredMethod;
    } else {
      // Otherwise, prioritize methods (TOTP, then SMS, then Email)
      if (availableMethods.includes(TwoFactorMethod.TOTP)) {
        selectedMethod = TwoFactorMethod.TOTP;
      } else if (availableMethods.includes(TwoFactorMethod.SMS)) {
        selectedMethod = TwoFactorMethod.SMS;
      } else if (availableMethods.includes(TwoFactorMethod.EMAIL)) {
        selectedMethod = TwoFactorMethod.EMAIL;
      } else {
        selectedMethod = availableMethods[0] as TwoFactorMethod;
      }
    }

    // If SMS or Email is selected, send verification code automatically
    if (selectedMethod === TwoFactorMethod.SMS) {
      // Generate code for SMS
      const phone = user.user_metadata?.mfaPhone;
      if (!phone) {
        return NextResponse.json(
          { error: 'No phone number found for SMS verification.' },
          { status: 400 }
        );
      }

      // Generate and send code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

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
      await supabase.auth.updateUser({
        data: {
          mfaLoginSmsCode: code,
          mfaLoginSmsCodeExpiresAt: expiresAt,
        },
      });
    } else if (selectedMethod === TwoFactorMethod.EMAIL) {
      // Generate code for Email
      const email = user.user_metadata?.mfaEmail || user.email;
      if (!email) {
        return NextResponse.json(
          { error: 'No email found for Email verification.' },
          { status: 400 }
        );
      }

      // Generate and send code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

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
      await supabase.auth.updateUser({
        data: {
          mfaLoginEmailCode: code,
          mfaLoginEmailCodeExpiresAt: expiresAt,
        },
      });
    }

    // Return MFA required response with selected method
    return NextResponse.json({
      mfaRequired: true,
      availableMethods,
      selectedMethod,
      accessToken,
      user
    });
  } catch (error) {
    console.error('Error in MFA check:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 