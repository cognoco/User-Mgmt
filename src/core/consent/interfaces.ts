import type { UserConsent, ConsentUpdatePayload } from './models';

export interface ConsentService {
  getUserConsent(userId: string): Promise<UserConsent | null>;
  updateUserConsent(
    userId: string,
    payload: ConsentUpdatePayload
  ): Promise<{ success: boolean; consent?: UserConsent; error?: string }>;
}
