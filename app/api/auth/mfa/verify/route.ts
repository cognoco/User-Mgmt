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
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { code, method, accessToken } = mfaVerifySchema.parse(body);

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
      
      case TwoFactorMethod.SMS:
      case TwoFactorMethod.EMAIL: {
        // Not implemented yet
        return NextResponse.json(
          { error: `${method} verification not implemented yet.` },
          { status: 501 }
        );
      }
      
      default:
        return NextResponse.json(
          { error: `Unsupported MFA method: ${method}` },
          { status: 400 }
        );
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
      expiresAt: session.session.expires_at
    });
  } catch (error) {
    console.error('Error in MFA verification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 