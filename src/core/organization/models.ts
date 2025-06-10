/**
 * Organization entity representing a company or group of users.
 *
 * @remarks
 * This model is used throughout the organization and team services.
 * It links to {@link Team} members via the organization ID.
 *
 * @example
 * ```ts
 * const org: Organization = {
 *   id: 'org_1',
 *   name: 'Acme Inc.',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 */
export interface Organization {
  /** Unique identifier of the organization */
  id: string;
  /** Display name of the organization */
  name: string;
  /** Optional description visible to members */
  description?: string;
  /** Timestamp when the organization was created */
  createdAt: Date;
  /** Timestamp when the organization was last updated */
  updatedAt: Date;
}

/**
 * Payload for creating a new organization.
 */
export interface OrganizationCreatePayload {
  /** Organization name */
  name: string;
  /** Optional description */
  description?: string;
}

/**
 * Payload for updating an existing organization.
 */
export interface OrganizationUpdatePayload {
  /** New organization name */
  name?: string;
  /** Updated description */
  description?: string;
}

/** Result type returned by organization operations */
export interface OrganizationResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Updated or created organization */
  organization?: Organization;
  /** Error message when {@link success} is `false` */
  error?: string;
}

/**
 * Organization member entity linking a user to an organization.
 */
export interface OrganizationMember {
  /** Organization identifier */
  organizationId: string;
  /** User identifier */
  userId: string;
  /** Role of the user within the organization */
  role: string;
}

/** Result type for organization membership operations */
export interface OrganizationMemberResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Created or updated member */
  member?: OrganizationMember;
  /** Error message when {@link success} is `false` */
  error?: string;
}
