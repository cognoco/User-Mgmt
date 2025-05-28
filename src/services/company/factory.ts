import { UserManagementConfiguration } from '@/core/config';
import { DefaultCompanyService, type CompanyService } from './companyService';

let companyServiceInstance: CompanyService | null = null;

export function getApiCompanyService(): CompanyService {
  if (!companyServiceInstance) {
    companyServiceInstance =
      (UserManagementConfiguration.getServiceProvider('companyService') as CompanyService) ||
      new DefaultCompanyService();
  }
  return companyServiceInstance;
}
