/**
 * Two-Factor Authentication Service Interface
 *
 * High level operations for managing two-factor authentication.
 * Implementations orchestrate validation and delegate persistence to
 * a data provider, keeping business logic separate from storage.
 */
import type {
  TwoFactorSetupPayload,
  TwoFactorSetupResponse,
  TwoFactorVerifyPayload,
  TwoFactorVerifyResponse,
  TwoFactorDisableResponse,
  BackupCodesResponse,
  MFAMethod,
  AvailableMFAMethod,
  TwoFactorMethodType,
} from '@/core/two-factor/models';

export interface TwoFactorService {
  /** Begin setup for a two-factor method */
  startSetup(payload: TwoFactorSetupPayload): Promise<TwoFactorSetupResponse>;

  /** Verify a setup code to activate 2FA */
  verifySetup(payload: TwoFactorVerifyPayload): Promise<TwoFactorVerifyResponse>;

  /** Disable a configured 2FA method */
  disable(userId: string, method: TwoFactorMethodType, code?: string): Promise<TwoFactorDisableResponse>;

  /** Retrieve a user's configured MFA methods */
  getUserMethods(userId: string): Promise<MFAMethod[]>;

  /** Retrieve all available MFA methods */
  getAvailableMethods(): Promise<AvailableMFAMethod[]>;

  /** Get existing backup codes for a user */
  getBackupCodes(userId: string): Promise<BackupCodesResponse>;

  /** Generate a new set of backup codes for a user */
  regenerateBackupCodes(userId: string): Promise<BackupCodesResponse>;

  /** Verify a backup code and consume it */
  verifyBackupCode(
    userId: string,
    code: string
  ): Promise<TwoFactorVerifyResponse>;

  /** Begin WebAuthn registration flow */
  startWebAuthnRegistration(userId: string): Promise<TwoFactorSetupResponse>;

  /** Complete WebAuthn registration */
  verifyWebAuthnRegistration(payload: TwoFactorVerifyPayload): Promise<TwoFactorVerifyResponse>;
}
