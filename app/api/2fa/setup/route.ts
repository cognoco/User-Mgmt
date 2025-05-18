import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { TwoFactorMethod } from '@/types/2fa';

// Request schema
const setupRequestSchema = z.object({
  method: z.nativeEnum(TwoFactorMethod),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { method } = setupRequestSchema.parse(body);

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    switch (method) {
      case TwoFactorMethod.TOTP: {
        // Generate a secret key for TOTP
        const secret = authenticator.generateSecret();
        
        // Generate a label for the authenticator app
        const appName = 'User Management';
        const accountName = user.email || user.id;
        const otpAuthUrl = authenticator.keyuri(accountName, appName, secret);
        
        // Generate a QR code for easy setup
        const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);
        
        // Store the secret temporarily in the user's metadata
        // Note: In a production app, you might want to store this encrypted
        // until verification is complete
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            tempTotpSecret: secret,
            totpVerified: false
          }
        });
        
        if (updateError) {
          console.error('Failed to update user metadata:', updateError);
          return NextResponse.json(
            { error: updateError.message },
            { status: 400 }
          );
        }
        
        return NextResponse.json({
          secret,
          qrCode: qrCodeDataUrl
        });
      }
      
      case TwoFactorMethod.SMS: {
        // Accept phone number from request (if not present in user metadata)
        let phone = user.user_metadata?.mfaPhone;
        if (!phone) {
          phone = body.phone;
        }
        if (!phone) {
          return NextResponse.json(
            { error: 'Phone number is required for SMS MFA setup.' },
            { status: 400 }
          );
        }

        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

        // Send SMS (mock)
        const { sendSms } = await import('@/lib/sms/sendSms');
        await sendSms({ to: phone, message: `Your verification code is: ${code}` });

        // Store code, expiry, and phone in user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            mfaSmsCode: code,
            mfaSmsCodeExpiresAt: expiresAt,
            mfaPhone: phone,
            mfaSmsVerified: false,
          },
        });
        if (updateError) {
          console.error('Failed to update user metadata:', updateError);
          return NextResponse.json(
            { error: updateError.message },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true });
      }
      
      case TwoFactorMethod.EMAIL: {
        // Accept email from request or use user's email
        let email = user.user_metadata?.mfaEmail;
        if (!email) {
          email = body.email || user.email;
        }
        if (!email) {
          return NextResponse.json(
            { error: 'Email address is required for Email MFA setup.' },
            { status: 400 }
          );
        }

        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

        // Send Email (abstracted)
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
            { error: 'Failed to send verification email.' },
            { status: 500 }
          );
        }

        // Store code, expiry, and email in user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            mfaEmailCode: code,
            mfaEmailCodeExpiresAt: expiresAt,
            mfaEmail: email,
            mfaEmailVerified: false,
          },
        });
        if (updateError) {
          console.error('Failed to update user metadata:', updateError);
          return NextResponse.json(
            { error: updateError.message },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true, testid: 'email-mfa-setup-success' });
      }
      
      default:
        return NextResponse.json(
          { error: `Unsupported MFA method: ${method}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in 2FA setup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 