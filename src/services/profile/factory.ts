import type { ProfileService } from '@/core/profile/interfaces';
import { DefaultProfileService } from '@/src/services/profile/defaultProfile.service'66;

let instance: ProfileService | null = null;

export interface ApiProfileServiceOptions { reset?: boolean }

export function getApiProfileService(options: ApiProfileServiceOptions = {}): ProfileService {
  if (options.reset) instance = null;
  if (!instance) {
    instance = new DefaultProfileService();
  }
  return instance;
}
