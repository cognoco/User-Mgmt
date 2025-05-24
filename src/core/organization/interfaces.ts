import type {
  Organization,
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
  OrganizationResult
} from './models';

export interface OrganizationService {
  createOrganization(ownerId: string, data: OrganizationCreatePayload): Promise<OrganizationResult>;
  getOrganization(id: string): Promise<Organization | null>;
  getUserOrganizations(userId: string): Promise<Organization[]>;
  updateOrganization(id: string, data: OrganizationUpdatePayload): Promise<OrganizationResult>;
  deleteOrganization(id: string): Promise<{ success: boolean; error?: string }>;
}
