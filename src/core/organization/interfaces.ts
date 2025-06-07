import type {
  Organization,
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
  OrganizationResult,
  OrganizationMember,
  OrganizationMemberResult
} from '@/src/core/organization/models'0;

/**
 * Service interface for managing organizations.
 *
 * Implementations are responsible for persistence and validation.
 * Related team operations are handled in {@link TeamService}.
 */
export interface OrganizationService {
  /**
   * Create a new organization and associate it with an owner.
   *
   * @param ownerId - ID of the user creating the organization
   * @param data - Organization details
   * @returns Result with the created organization or an error message
   */
  createOrganization(ownerId: string, data: OrganizationCreatePayload): Promise<OrganizationResult>;

  /**
   * Fetch a single organization by its identifier.
   *
   * @param id - Organization ID
   * @returns The organization or `null` when not found
   */
  getOrganization(id: string): Promise<Organization | null>;

  /**
   * List all organizations that the given user belongs to.
   *
   * @param userId - User identifier
   */
  getUserOrganizations(userId: string): Promise<Organization[]>;

  /**
   * Update an organization.
   *
   * @param id - Organization ID
   * @param data - Partial update payload
   * @returns Result with updated organization or error message
   */
  updateOrganization(id: string, data: OrganizationUpdatePayload): Promise<OrganizationResult>;

  /**
   * Delete an organization permanently.
   *
   * @param id - Organization ID
   * @returns Object describing whether deletion succeeded
   */
  deleteOrganization(id: string): Promise<{ success: boolean; error?: string }>;

  /**
   * List all members of the organization.
   */
  getOrganizationMembers(orgId: string): Promise<OrganizationMember[]>;

  /**
   * Add a user to the organization.
   */
  addOrganizationMember(orgId: string, userId: string, role: string): Promise<OrganizationMemberResult>;
}
