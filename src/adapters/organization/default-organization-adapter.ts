import type { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import type {
  Organization,
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
  OrganizationResult
} from '@/core/organization/models';

export class DefaultOrganizationAdapter implements IOrganizationDataProvider {
  async createOrganization(
    ownerId: string,
    data: OrganizationCreatePayload
  ): Promise<OrganizationResult> {
    return { success: false, error: 'Not implemented' };
  }

  async getOrganization(id: string): Promise<Organization | null> {
    return null;
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    return [];
  }

  async updateOrganization(
    id: string,
    data: OrganizationUpdatePayload
  ): Promise<OrganizationResult> {
    return { success: false, error: 'Not implemented' };
  }

  async deleteOrganization(id: string): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Not implemented' };
  }
}

export default DefaultOrganizationAdapter;
