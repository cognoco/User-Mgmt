export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keySecret?: string; // Only shown once on creation
  permissions: string[];
  lastUsedAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}
