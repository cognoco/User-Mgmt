import type { UserConsent, ConsentUpdatePayload } from '@/src/core/consent/models'0;

export interface IConsentDataProvider {
  getUserConsent(userId: string): Promise<UserConsent | null>;
  saveUserConsent(
    userId: string,
    payload: ConsentUpdatePayload
  ): Promise<{ success: boolean; consent?: UserConsent; error?: string }>;
}
