export type TwoFactorMethodType = 'totp' | 'sms' | 'email';

export interface TwoFactorSetupPayload {
  userId: string;
  method: TwoFactorMethodType;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  error?: string;
}

export interface TwoFactorVerifyPayload {
  userId: string;
  code: string;
  method: TwoFactorMethodType;
  isBackupCode?: boolean;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  token?: string;
  backupCodes?: string[];
  error?: string;
}

export interface TwoFactorDisableResponse {
  success: boolean;
  error?: string;
}

export interface BackupCodesResponse {
  success: boolean;
  codes?: string[];
  error?: string;
}

export interface MFAMethod {
  id: string;
  type: TwoFactorMethodType;
  name: string;
  isEnabled: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface AvailableMFAMethod {
  type: TwoFactorMethodType;
  name: string;
  description: string;
  canEnable: boolean;
}
