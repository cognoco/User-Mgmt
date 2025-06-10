import type { ProfileVerificationService } from '@/core/profileVerification/interfaces';
import { DefaultProfileVerificationService } from '@/services/profile-verification/defaultProfileVerification.service';
import { getServiceContainer } from '@/lib/config/serviceContainer';

export interface ApiProfileVerificationServiceOptions {
  reset?: boolean;
}

let instance: ProfileVerificationService | null = null;
let constructing = false;

export function getApiProfileVerificationService(
  options: ApiProfileVerificationServiceOptions = {},
): ProfileVerificationService {
  if (options.reset) {
    instance = null;
  }

  if (!instance && !constructing) {
    constructing = true;
    try {
      const container = getServiceContainer();
      const existing = (container as any).profileVerification as ProfileVerificationService | undefined;
      if (existing) {
        instance = existing;
      }
    } finally {
      constructing = false;
    }
  }

  if (!instance) {
    instance = new DefaultProfileVerificationService();
  }

  return instance;
}
