import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authenticator } from 'otplib';
import { TwoFactorMethod } from '@/types/2fa';

// Request schema for MFA verification
const mfaVerifySchema = z.object({
  code: z.string().min(6).max(8),
  method: z.nativeEnum(TwoFactorMethod).default(TwoFactorMethod.TOTP),
  accessToken: z.string(), // Temporary access token from initial login
  rememberDevice: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { code, method, accessToken, rememberDevice } = mfaVerifySchema.parse(body);

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
    // Note: This is needed because the user has only completed the first 
    // authentication factor (password) but not the second (MFA)
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

    // Verify MFA code based on method
    switch (method) {
      case TwoFactorMethod.TOTP: {
        // Get the TOTP secret from user metadata
        const totpSecret = user.user_metadata?.totpSecret;
        
        if (!totpSecret) {
          return NextResponse.json(
            { error: 'TOTP is not set up for this account.' },
            { status: 400 }
          );
        }
        
        // Verify the TOTP code
        const isValid = authenticator.verify({
          token: code,
          secret: totpSecret
        });
        
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid verification code.' },
            { status: 400 }
          );
        }
        
        break;
      }
      
      case TwoFactorMethod.SMS: {
        // Verify SMS code against metadata
        if (!user.user_metadata?.mfaSmsVerified) {
          return NextResponse.json(
            { error: 'SMS MFA is not enabled for this account.' },
            { status: 400 }
          );
        }
        
        // Check if there's a valid verification code for login
        const storedCode = user.user_metadata?.mfaLoginSmsCode;
        const expiresAt = user.user_metadata?.mfaLoginSmsCodeExpiresAt;
        
        if (!storedCode || !expiresAt) {
          return NextResponse.json(
            { error: 'No SMS verification code was sent. Please request a code.' },
            { status: 400 }
          );
        }
        
        // Check if code is expired
        const now = new Date();
        if (now > new Date(expiresAt)) {
          return NextResponse.json(
            { error: 'Verification code expired. Please request a new code.' },
            { status: 400 }
          );
        }
        
        // Check if code matches
        if (code !== storedCode) {
          return NextResponse.json(
            { error: 'Invalid verification code. Please try again.' },
            { status: 400 }
          );
        }
        
        // Clear the SMS code after successful verification
        await supabase.auth.updateUser({
          data: {
            mfaLoginSmsCode: null,
            mfaLoginSmsCodeExpiresAt: null
          }
        });
        
        break;
      }
      
      case TwoFactorMethod.EMAIL: {
        // Verify Email code against metadata
        if (!user.user_metadata?.mfaEmailVerified) {
          return NextResponse.json(
            { error: 'Email MFA is not enabled for this account.' },
            { status: 400 }
          );
        }
        
        // Check if there's a valid verification code for login
        const storedCode = user.user_metadata?.mfaLoginEmailCode;
        const expiresAt = user.user_metadata?.mfaLoginEmailCodeExpiresAt;
        
        if (!storedCode || !expiresAt) {
          return NextResponse.json(
            { error: 'No Email verification code was sent. Please request a code.' },
            { status: 400 }
          );
        }
        
        // Check if code is expired
        const now = new Date();
        if (now > new Date(expiresAt)) {
          return NextResponse.json(
            { error: 'Verification code expired. Please request a new code.' },
            { status: 400 }
          );
        }
        
        // Check if code matches
        if (code !== storedCode) {
          return NextResponse.json(
            { error: 'Invalid verification code. Please try again.' },
            { status: 400 }
          );
        }
        
        // Clear the Email code after successful verification
        await supabase.auth.updateUser({
          data: {
            mfaLoginEmailCode: null,
            mfaLoginEmailCodeExpiresAt: null
          }
        });
        
        break;
      }
      
      default:
        return NextResponse.json(
          { error: `Unsupported MFA method: ${method}` },
          { status: 400 }
        );
    }

    // Handle "Remember Device" feature
    let sessionExpirySeconds = 3600; // Default 1 hour
    if (rememberDevice) {
      sessionExpirySeconds = 30 * 24 * 60 * 60; // 30 days
      
      // Update user preferences to remember this device
      await supabase.auth.updateUser({
        data: {
          rememberDevice: true,
          lastMFAVerification: new Date().toISOString(),
          sessionExpirySeconds
        }
      });
    }

    // MFA verified successfully, create a new session
    const { data: session, error: loginError } = await supabase.auth.getSession();

    if (loginError || !session || !session.session) {
      console.error('Failed to get session after MFA:', loginError);
      return NextResponse.json(
        { error: 'Failed to complete authentication.' },
        { status: 500 }
      );
    }

    // Return full authenticated session
    return NextResponse.json({
      user,
      token: session.session.access_token,
      expiresAt: session.session.expires_at,
      rememberDevice: !!rememberDevice
    });
  } catch (error) {
    console.error('Error in MFA verification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 