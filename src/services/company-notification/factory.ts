import { DefaultCompanyNotificationService } from '@/src/services/company-notification/defaultCompanyNotification.service';
import type { CompanyNotificationService } from '@/core/companyNotification/interfaces';
import { getServiceContainer } from '@/lib/config/serviceContainer';

export interface ApiCompanyNotificationServiceOptions {
  reset?: boolean;
}

let instance: CompanyNotificationService | null = null;
let constructing = false;

export function getApiCompanyNotificationService(
  options: ApiCompanyNotificationServiceOptions = {}
): CompanyNotificationService {
  if (options.reset) {
    instance = null;
  }

  if (!instance && !constructing) {
    constructing = true;
    try {
      const container = getServiceContainer();
      const existing = (container as any).companyNotification as CompanyNotificationService | undefined;
      if (existing) {
        instance = existing;
      }
    } finally {
      constructing = false;
    }
  }

  if (!instance) {
    instance = new DefaultCompanyNotificationService();
  }

  return instance;
}
