import type { OrganizationService } from '@/core/organization/interfaces';
import type { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import type {
  Organization,
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
  OrganizationResult,
  OrganizationMember,
  OrganizationMemberResult
} from '@/core/organization/models';

export class DefaultOrganizationService implements OrganizationService {
  constructor(private provider: IOrganizationDataProvider) {}

  createOrganization(ownerId: string, data: OrganizationCreatePayload): Promise<OrganizationResult> {
    return this.provider.createOrganization(ownerId, data);
  }

  getOrganization(id: string): Promise<Organization | null> {
    return this.provider.getOrganization(id);
  }

  getUserOrganizations(userId: string): Promise<Organization[]> {
    return this.provider.getUserOrganizations(userId);
  }

  updateOrganization(id: string, data: OrganizationUpdatePayload): Promise<OrganizationResult> {
    return this.provider.updateOrganization(id, data);
  }

  deleteOrganization(id: string): Promise<{ success: boolean; error?: string }> {
    return this.provider.deleteOrganization(id);
  }

  getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    return this.provider.getMembers(orgId);
  }

  addOrganizationMember(orgId: string, userId: string, role: string): Promise<OrganizationMemberResult> {
    return this.provider.addMember(orgId, userId, role);
  }
}
