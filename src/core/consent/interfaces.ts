import type { UserConsent, ConsentUpdatePayload } from '@/src/core/consent/models'0;

export interface ConsentService {
  getUserConsent(userId: string): Promise<UserConsent | null>;
  updateUserConsent(
    userId: string,
    payload: ConsentUpdatePayload
  ): Promise<{ success: boolean; consent?: UserConsent; error?: string }>;
}
