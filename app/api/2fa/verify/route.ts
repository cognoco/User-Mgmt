import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authenticator } from 'otplib';
import { TwoFactorMethod, TwoFactorVerification } from '@/types/2fa';

// Request schema
const verifyRequestSchema = z.object({
  method: z.nativeEnum(TwoFactorMethod),
  code: z.string().min(6).max(8),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const verification = verifyRequestSchema.parse(body) as TwoFactorVerification;

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

    switch (verification.method) {
      case TwoFactorMethod.TOTP: {
        // Get the temporary TOTP secret from user metadata
        const totpSecret = user.user_metadata?.tempTotpSecret;
        
        if (!totpSecret) {
          return NextResponse.json(
            { error: 'No TOTP setup in progress. Please start setup first.' },
            { status: 400 }
          );
        }
        
        // Verify the TOTP code
        const isValid = authenticator.verify({
          token: verification.code,
          secret: totpSecret
        });
        
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid verification code. Please try again.' },
            { status: 400 }
          );
        }
        
        // Update user metadata to enable TOTP
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            totpSecret,
            totpEnabled: true,
            totpVerified: true,
            mfaMethods: [TwoFactorMethod.TOTP],
            // Remove the temporary secret
            tempTotpSecret: null
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
          success: true,
          method: TwoFactorMethod.TOTP
        });
      }
      
      case TwoFactorMethod.SMS:
      case TwoFactorMethod.EMAIL: {
        // TODO: Implement SMS and Email verification
        return NextResponse.json(
          { error: `${verification.method} verification not implemented yet` },
          { status: 501 }
        );
      }
      
      default:
        return NextResponse.json(
          { error: `Unsupported MFA method: ${verification.method}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in 2FA verification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 