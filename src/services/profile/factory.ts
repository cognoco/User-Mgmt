import type { ProfileService } from '@/core/profile/interfaces';
import { DefaultProfileService } from '@/services/profile/defaultProfile.service';

let instance: ProfileService | null = null;

export interface ApiProfileServiceOptions { reset?: boolean }

export function getApiProfileService(options: ApiProfileServiceOptions = {}): ProfileService {
  if (options.reset) instance = null;
  if (!instance) {
    instance = new DefaultProfileService();
  }
  return instance;
}
