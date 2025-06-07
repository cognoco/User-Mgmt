import type {
  TwoFactorSetupPayload,
  TwoFactorSetupResponse,
  TwoFactorVerifyPayload,
  TwoFactorVerifyResponse,
  TwoFactorDisableResponse,
  BackupCodesResponse,
  TwoFactorMethodType,
} from '@/src/core/two-factor/models';

/**
 * Two-Factor Authentication Data Provider Interface
 *
 * Defines the contract for persistence operations related to two-factor
 * authentication. Implementations handle storing secrets, verifying codes
 * and managing backup codes. No business logic should be included here.
 */
export interface ITwoFactorDataProvider {
  /**
   * Start two-factor setup for a user.
   *
   * @param payload User id and selected method
   * @returns Setup details including shared secret and QR code
   */
  startSetup(payload: TwoFactorSetupPayload): Promise<TwoFactorSetupResponse>;

  /**
   * Verify a two-factor code and complete setup.
   *
   * @param payload Verification payload with code and method
   * @returns Verification result with optional token or backup codes
   */
  verifySetup(payload: TwoFactorVerifyPayload): Promise<TwoFactorVerifyResponse>;

  /**
   * Disable two-factor authentication for a user.
   *
   * @param userId ID of the user
   * @param method Method to disable
   * @param code Optional confirmation code
   * @returns Result object with success state or error
   */
  disable(userId: string, method: TwoFactorMethodType, code?: string): Promise<TwoFactorDisableResponse>;

  /**
   * Get the current backup codes for a user.
   *
   * @param userId ID of the user
   * @returns Backup codes or an error
   */
  getBackupCodes(userId: string): Promise<BackupCodesResponse>;

  /**
   * Regenerate backup codes for a user.
   *
   * @param userId ID of the user
   * @returns New backup codes or an error
   */
  regenerateBackupCodes(userId: string): Promise<BackupCodesResponse>;

  /** Begin WebAuthn registration */
  startWebAuthnRegistration(userId: string): Promise<TwoFactorSetupResponse>;

  /** Complete WebAuthn registration */
  verifyWebAuthnRegistration(payload: TwoFactorVerifyPayload): Promise<TwoFactorVerifyResponse>;
}
