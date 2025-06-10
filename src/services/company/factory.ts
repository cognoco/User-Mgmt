/**
 * Company Service Factory for API routes.
 *
 * Provides a configured {@link CompanyService} instance with optional caching
 * and reset functionality for tests.
 */
import { UserManagementConfiguration } from '@/core/config';
import { DefaultCompanyService, type CompanyService } from '@/services/company/companyService';
import { getServiceContainer } from '@/lib/config/serviceContainer';

/** Options for {@link getApiCompanyService}. */
export interface ApiCompanyServiceOptions {
  /** When true, clears the cached instance. */
  reset?: boolean;
}

let companyServiceInstance: CompanyService | null = null;
let constructing = false;

export function getApiCompanyService(
  options: ApiCompanyServiceOptions = {}
): CompanyService {
  if (options.reset) {
    companyServiceInstance = null;
  }

  if (!companyServiceInstance && !constructing) {
    constructing = true;
    try {
      const containerService = (getServiceContainer() as any).company as CompanyService | undefined;
      if (containerService) {
        companyServiceInstance = containerService;
      }
    } finally {
      constructing = false;
    }
  }

  if (!companyServiceInstance) {
    companyServiceInstance =
      (UserManagementConfiguration.getServiceProvider('companyService') as CompanyService) ||
      new DefaultCompanyService();
  }

  return companyServiceInstance;
}
