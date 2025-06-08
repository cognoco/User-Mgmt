import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import crypto from 'crypto';
import {
  generateRegistration,
  verifyRegistration
} from '@/lib/webauthn/webauthn.service';
import type {
  TwoFactorSetupPayload,
  TwoFactorSetupResponse,
  TwoFactorVerifyPayload,
  TwoFactorVerifyResponse,
  TwoFactorDisableResponse,
  BackupCodesResponse,
  TwoFactorMethodType
} from '@/core/two-factor/models';
import type { ITwoFactorDataProvider } from '@/core/two-factor/ITwoFactorDataProvider';

export class SupabaseTwoFactorProvider implements ITwoFactorDataProvider {
  private supabase: SupabaseClient;

  constructor(private supabaseUrl: string, private supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async startSetup(payload: TwoFactorSetupPayload): Promise<TwoFactorSetupResponse> {
    const { userId, method, phone, email } = payload;
    const { data: { user }, error } = await this.supabase.auth.admin.getUserById(userId);
    if (error || !user) {
      return { success: false, error: 'User not found' };
    }

    switch (method) {
      case 'totp': {
        const secret = authenticator.generateSecret();
        const { error: upd } = await this.supabase.auth.admin.updateUserById(userId, {
          user_metadata: { tempTotpSecret: secret }
        });
        if (upd) return { success: false, error: upd.message };
        const appName = 'User Management';
        const accountName = user.email || user.id;
        const otpAuthUrl = authenticator.keyuri(accountName, appName, secret);
        const qrCode = await qrcode.toDataURL(otpAuthUrl);
        return { success: true, secret, qrCode };
      }
      case 'email': {
        const targetEmail = email || user.user_metadata?.mfaEmail || user.email;
        if (!targetEmail) return { success: false, error: 'Email address is required for Email MFA' };
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        try {
          // Only send email on server side
          if (typeof window === 'undefined') {
            const { sendEmail } = await import('@/lib/email/sendEmail');
            await sendEmail({
              to: targetEmail,
              subject: 'Your MFA Verification Code',
              html: `<p>Your verification code is: <b>${code}</b></p>`
            });
          }
        } catch {
          return { success: false, error: 'Failed to send verification email' };
        }
        const { error: upd } = await this.supabase.auth.admin.updateUserById(userId, {
          user_metadata: { mfaEmail: targetEmail, mfaEmailCode: code, mfaEmailCodeExpiresAt: expiresAt }
        });
        if (upd) return { success: false, error: upd.message };
        return { success: true };
      }
      case 'sms': {
        const targetPhone = phone || user.user_metadata?.mfaPhone;
        if (!targetPhone) return { success: false, error: 'Phone number is required for SMS MFA' };
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        try {
          // Only send SMS on server side
          if (typeof window === 'undefined') {
            const { sendSms } = await import('@/lib/sms/sendSms');
            await sendSms({ to: targetPhone, message: `Your verification code is: ${code}` });
          }
        } catch {
          return { success: false, error: 'Failed to send SMS verification code' };
        }
        const { error: upd } = await this.supabase.auth.admin.updateUserById(userId, {
          user_metadata: { mfaPhone: targetPhone, mfaSmsCode: code, mfaSmsCodeExpiresAt: expiresAt }
        });
        if (upd) return { success: false, error: upd.message };
        return { success: true };
      }
      default:
        return { success: false, error: `Unsupported MFA method: ${method}` };
    }
  }

  async verifySetup(payload: TwoFactorVerifyPayload): Promise<TwoFactorVerifyResponse> {
    const { userId, code, method } = payload;
    const { data: { user }, error } = await this.supabase.auth.admin.getUserById(userId);
    if (error || !user) {
      return { success: false, error: 'Authentication required' };
    }

    switch (method) {
      case 'totp': {
        const secret = user.user_metadata?.tempTotpSecret;
        if (!secret) return { success: false, error: 'No TOTP setup in progress. Please start setup first.' };
        const isValid = authenticator.verify({ token: code, secret });
        if (!isValid) return { success: false, error: 'Invalid verification code. Please try again.' };
        const { error: upd } = await this.supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            totpSecret: secret,
            totpEnabled: true,
            totpVerified: true,
            mfaMethods: ['totp'],
            tempTotpSecret: null
          }
        });
        if (upd) return { success: false, error: upd.message };
        return { success: true };
      }
      case 'sms': {
        const storedCode = user.user_metadata?.mfaSmsCode;
        const expiresAt = user.user_metadata?.mfaSmsCodeExpiresAt;
        if (!storedCode || !expiresAt) {
          return { success: false, error: 'No SMS verification in progress. Please start setup first.' };
        }
        if (new Date() > new Date(expiresAt)) {
          return { success: false, error: 'Verification code expired. Please request a new code.' };
        }
        if (code !== storedCode) {
          return { success: false, error: 'Invalid verification code. Please try again.' };
        }
        const methods = Array.isArray(user.user_metadata?.mfaMethods)
          ? Array.from(new Set([...user.user_metadata.mfaMethods, 'sms']))
          : ['sms'];
        const { error: upd } = await this.supabase.auth.admin.updateUserById(userId, {
          user_metadata: { mfaSmsVerified: true, mfaMethods: methods, mfaSmsCode: null, mfaSmsCodeExpiresAt: null }
        });
        if (upd) return { success: false, error: upd.message };
        return { success: true };
      }
      case 'email': {
        const storedCode = user.user_metadata?.mfaEmailCode;
        const expiresAt = user.user_metadata?.mfaEmailCodeExpiresAt;
        if (!storedCode || !expiresAt) {
          return { success: false, error: 'No Email verification in progress. Please start setup first.' };
        }
        if (new Date() > new Date(expiresAt)) {
          return { success: false, error: 'Verification code expired. Please request a new code.' };
        }
        if (code !== storedCode) {
          return { success: false, error: 'Invalid verification code. Please try again.' };
        }
        const methods = Array.isArray(user.user_metadata?.mfaMethods)
          ? Array.from(new Set([...user.user_metadata.mfaMethods, 'email']))
          : ['email'];
        const { error: upd } = await this.supabase.auth.admin.updateUserById(userId, {
          user_metadata: { mfaEmailVerified: true, mfaMethods: methods, mfaEmailCode: null, mfaEmailCodeExpiresAt: null }
        });
        if (upd) return { success: false, error: upd.message };
        return { success: true };
      }
      default:
        return { success: false, error: `Unsupported MFA method: ${method}` };
    }
  }

  async disable(userId: string, method: TwoFactorMethodType, _code?: string): Promise<TwoFactorDisableResponse> {
    const { data: { user }, error } = await this.supabase.auth.admin.getUserById(userId);
    if (error || !user) {
      return { success: false, error: 'User not found' };
    }

    if (method !== 'totp') {
      return { success: false, error: `Unsupported MFA method: ${method}` };
    }

    if (user.user_metadata?.totpEnabled !== true) {
      return { success: false, error: 'MFA is not enabled' };
    }

    const { error: upd } = await this.supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        totpSecret: null,
        totpEnabled: false,
        totpVerified: false,
        mfaMethods: [],
        backupCodes: null,
        backupCodesGeneratedAt: null
      }
    });
    if (upd) {
      return { success: false, error: upd.message };
    }
    return { success: true };
  }

  async getBackupCodes(userId: string): Promise<BackupCodesResponse> {
    const { data: { user }, error } = await this.supabase.auth.admin.getUserById(userId);
    if (error || !user) return { success: false, error: 'User not found' };
    return { success: true, codes: user.user_metadata?.backupCodes || [] };
  }

  async regenerateBackupCodes(userId: string): Promise<BackupCodesResponse> {
    const codes = this.generateBackupCodes();
    const { error } = await this.supabase.auth.admin.updateUserById(userId, {
      user_metadata: { backupCodes: codes, backupCodesGeneratedAt: new Date().toISOString() }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, codes };
  }

  async startWebAuthnRegistration(userId: string): Promise<TwoFactorSetupResponse> {
    try {
      const options = await generateRegistration(userId);
      return { success: true, ...options } as any;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async verifyWebAuthnRegistration(payload: TwoFactorVerifyPayload): Promise<TwoFactorVerifyResponse> {
    try {
      const result = await verifyRegistration(payload.userId, payload.code as any);
      return { success: true, ...result } as any;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private generateBackupCodes(count = 10, length = 8): string[] {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const bytes = crypto.randomBytes(length);
      let code = '';
      for (let j = 0; j < length; j++) {
        code += chars[bytes[j] % chars.length];
      }
      codes.push(`${code.slice(0,4)}-${code.slice(4)}`);
    }
    return codes;
  }
}

export default SupabaseTwoFactorProvider;
