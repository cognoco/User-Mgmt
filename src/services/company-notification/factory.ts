import { DefaultCompanyNotificationService } from './default-company-notification.service';
import type { CompanyNotificationService } from '@/core/company-notification/interfaces';
import { getServiceContainer } from '@/lib/config/service-container';

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
