import { ConsentService } from '@/core/consent/interfaces';
import type { IConsentDataProvider } from '@/core/consent/IConsentDataProvider';
import type { ConsentUpdatePayload, UserConsent } from '@/core/consent/models';

export class DefaultConsentService implements ConsentService {
  constructor(private provider: IConsentDataProvider) {}

  getUserConsent(userId: string): Promise<UserConsent | null> {
    return this.provider.getUserConsent(userId);
  }

  updateUserConsent(
    userId: string,
    payload: ConsentUpdatePayload
  ): Promise<{ success: boolean; consent?: UserConsent; error?: string }> {
    return this.provider.saveUserConsent(userId, payload);
  }
}
