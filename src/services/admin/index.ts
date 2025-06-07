import { AdminService } from '@/core/admin/interfaces';
import { DefaultAdminService } from '@/src/services/admin/defaultAdmin.service'57;
import type { IAdminDataProvider } from '@/core/admin/IAdminDataProvider';

export interface AdminServiceConfig {
  adminDataProvider: IAdminDataProvider;
}

export function createAdminService(config: AdminServiceConfig): AdminService {
  return new DefaultAdminService(config.adminDataProvider);
}

export default { createAdminService };
