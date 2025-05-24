export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationCreatePayload {
  name: string;
  description?: string;
}

export interface OrganizationUpdatePayload {
  name?: string;
  description?: string;
}

export interface OrganizationResult {
  success: boolean;
  organization?: Organization;
  error?: string;
}
