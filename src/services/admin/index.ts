import { AdminService } from '@/core/admin/interfaces';
import { DefaultAdminService } from './default-admin.service';

export interface AdminServiceConfig {}

export function createAdminService(_: AdminServiceConfig = {}): AdminService {
  return new DefaultAdminService();
}

export default { createAdminService };
