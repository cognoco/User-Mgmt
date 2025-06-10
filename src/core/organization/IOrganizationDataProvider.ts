import type {
  Organization,
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
  OrganizationResult,
  OrganizationMember,
  OrganizationMemberResult
} from '@/core/organization/models';

export interface IOrganizationDataProvider {
  createOrganization(ownerId: string, data: OrganizationCreatePayload): Promise<OrganizationResult>;
  getOrganization(id: string): Promise<Organization | null>;
  getUserOrganizations(userId: string): Promise<Organization[]>;
  updateOrganization(id: string, data: OrganizationUpdatePayload): Promise<OrganizationResult>;
  deleteOrganization(id: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get members of an organization.
   */
  getMembers(orgId: string): Promise<OrganizationMember[]>;

  /**
   * Add a member to an organization.
   */
  addMember(orgId: string, userId: string, role: string): Promise<OrganizationMemberResult>;
}
