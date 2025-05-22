import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { TwoFactorMethod } from '@/types/2fa';
import { getApiTwoFactorService } from '@/lib/api/two-factor/factory';
import { getApiAuthService } from '@/lib/api/auth/factory';

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

    // Get service instances from factories
    const authService = getApiAuthService();
    const twoFactorService = getApiTwoFactorService();
    
    // Verify user authentication
    const cookieStore = cookies();
    const user = await authService.getCurrentUser(cookieStore);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    switch (method) {
      case TwoFactorMethod.TOTP: {
        try {
          // Use the two-factor service to set up TOTP
          const setupResult = await twoFactorService.setupTOTP(user.id);
          
          // Generate a QR code for easy setup
          const appName = 'User Management';
          const accountName = user.email || user.id;
          const otpAuthUrl = authenticator.keyuri(accountName, appName, setupResult.secret);
          const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);
          
          return NextResponse.json({
            secret: setupResult.secret,
            qrCode: qrCodeDataUrl
          });
        } catch (error) {
          console.error('Failed to set up TOTP:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to set up TOTP' },
            { status: 400 }
          );
        }
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

        try {
          // Use the two-factor service to set up SMS
          const result = await twoFactorService.setupSMS(user.id, phone);
          return NextResponse.json({ success: true });
        } catch (error) {
          console.error('Failed to set up SMS MFA:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to set up SMS MFA' },
            { status: 400 }
          );
        }
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

        try {
          // Use the two-factor service to set up Email MFA
          const result = await twoFactorService.setupEmail(user.id, email);
          return NextResponse.json({ success: true, testid: 'email-mfa-setup-success' });
        } catch (error) {
          console.error('Failed to set up Email MFA:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send verification email.' },
            { status: 500 }
          );
        }
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