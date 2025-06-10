import type { UserConsent, ConsentUpdatePayload } from '@/core/consent/models';

export interface ConsentService {
  getUserConsent(userId: string): Promise<UserConsent | null>;
  updateUserConsent(
    userId: string,
    payload: ConsentUpdatePayload
  ): Promise<{ success: boolean; consent?: UserConsent; error?: string }>;
}
