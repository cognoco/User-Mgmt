import type { AuthDataProvider } from '@/adapters/auth/interfaces';
import type { AuthResult, MFASetupResponse, MFAVerifyResponse } from '@/core/auth/models';

export interface MFAHandler {
  setupMFA(): Promise<MFASetupResponse>;
  verifyMFA(code: string): Promise<MFAVerifyResponse>;
  disableMFA(code: string): Promise<AuthResult>;
}

export class DefaultMFAHandler implements MFAHandler {
  constructor(private provider: AuthDataProvider) {}

  setupMFA(): Promise<MFASetupResponse> {
    return this.provider.setupMFA();
  }

  verifyMFA(code: string): Promise<MFAVerifyResponse> {
    return this.provider.verifyMFA(code);
  }

  disableMFA(code: string): Promise<AuthResult> {
    return this.provider.disableMFA(code);
  }
}
