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
        // TODO: Implement SMS-based MFA
        // For now, return a not implemented response
        return NextResponse.json(
          { error: 'SMS-based MFA not implemented yet' },
          { status: 501 }
        );
      }
      
      case TwoFactorMethod.EMAIL: {
        // TODO: Implement email-based MFA
        // For now, return a not implemented response
        return NextResponse.json(
          { error: 'Email-based MFA not implemented yet' },
          { status: 501 }
        );
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