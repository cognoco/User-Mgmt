import type { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import type {
  Organization,
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
  OrganizationResult
} from '@/core/organization/models';

export class DefaultOrganizationAdapter implements IOrganizationDataProvider {
  async createOrganization(
    _ownerId: string,
    _data: OrganizationCreatePayload
  ): Promise<OrganizationResult> {
    return { success: false, error: 'Not implemented' };
  }

  async getOrganization(_id: string): Promise<Organization | null> {
    return null;
  }

  async getUserOrganizations(_userId: string): Promise<Organization[]> {
    return [];
  }

  async updateOrganization(
    _id: string,
    _data: OrganizationUpdatePayload
  ): Promise<OrganizationResult> {
    return { success: false, error: 'Not implemented' };
  }

  async deleteOrganization(_id: string): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Not implemented' };
  }
}

export default DefaultOrganizationAdapter;
