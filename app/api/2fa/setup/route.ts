import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { TwoFactorMethod } from '@/types/2fa';
import { createApiHandler } from '@/lib/api/route-helpers';
import { createSuccessResponse } from '@/lib/api/common';

// Request schema
const setupRequestSchema = z.object({
  method: z.nativeEnum(TwoFactorMethod),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export const POST = createApiHandler(
  setupRequestSchema,
  async (request: NextRequest, authContext, data, services) => {
    try {
      const user = authContext.user!;
      const { method, phone, email } = data;

      switch (method) {
      case TwoFactorMethod.TOTP: {
        try {
          const setupResult = await services.twoFactor!.setupTOTP(user.id);
          const appName = 'User Management';
          const accountName = user.email || user.id;
          const otpAuthUrl = authenticator.keyuri(accountName, appName, setupResult.secret);
          const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);
          return createSuccessResponse({ secret: setupResult.secret, qrCode: qrCodeDataUrl });
        } catch (error) {
          console.error('Failed to set up TOTP:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to set up TOTP' },
            { status: 400 }
          );
        }
      }

      case TwoFactorMethod.SMS: {
        const resolvedPhone = user.user_metadata?.mfaPhone || phone;
        if (!resolvedPhone) {
          return NextResponse.json(
            { error: 'Phone number is required for SMS MFA setup.' },
            { status: 400 }
          );
        }
        try {
          await services.twoFactor!.setupSMS(user.id, resolvedPhone);
          return createSuccessResponse({ success: true });
        } catch (error) {
          console.error('Failed to set up SMS MFA:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to set up SMS MFA' },
            { status: 400 }
          );
        }
      }

      case TwoFactorMethod.EMAIL: {
        const resolvedEmail = user.user_metadata?.mfaEmail || email || user.email;
        if (!resolvedEmail) {
          return NextResponse.json(
            { error: 'Email address is required for Email MFA setup.' },
            { status: 400 }
          );
        }
        try {
          await services.twoFactor!.setupEmail(user.id, resolvedEmail);
          return createSuccessResponse({ success: true, testid: 'email-mfa-setup-success' });
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
  },
  { requireAuth: true, includeUser: true }
);
