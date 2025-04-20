import { z } from 'zod';

// Base schemas for common fields
export const baseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// User schema
export const userSchema = baseEntitySchema.extend({
  email: z.string().email(),
  name: z.string().min(2),
  emailVerified: z.boolean().default(false),
  role: z.enum(['user', 'admin', 'moderator']).default('user'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

// Profile schema
export const profileSchema = baseEntitySchema.extend({
  userId: z.string().uuid(),
  userType: z.enum(['private', 'corporate']).default('private'),
  avatarUrl: z.string().url().nullable(),
  bio: z.string().max(500).nullable(),
  location: z.string().max(100).nullable(),
  website: z.string().url().nullable(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).nullable(),
  privacySettings: z.object({
    showEmail: z.boolean().default(false),
    showPhone: z.boolean().default(false),
    showLocation: z.boolean().default(false),
    profileVisibility: z.enum(['public', 'private', 'contacts']).default('private'),
  }).default({}),
  companyName: z.string().nullable().optional(),
  companyLogoUrl: z.string().url().nullable().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).nullable().optional(),
  industry: z.string().nullable().optional(),
  companyWebsite: z.string().url().nullable().optional(),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  vatId: z.string().nullable().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).nullable().optional(),
});

// User preferences schema
export const userPreferencesSchema = baseEntitySchema.extend({
  userId: z.string().uuid(),
  language: z.string().default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }).default({}),
});

// Activity log schema
export const activityLogSchema = baseEntitySchema.extend({
  userId: z.string().uuid(),
  action: z.string(),
  details: z.record(z.unknown()).nullable(),
  ipAddress: z.string().ip().nullable(),
  userAgent: z.string().nullable(),
});

// Types
export type BaseEntity = z.infer<typeof baseEntitySchema>;
export type User = z.infer<typeof userSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type ActivityLog = z.infer<typeof activityLogSchema>;

// Database relationships
export interface UserWithRelations extends User {
  profile: Profile | null;
  preferences: UserPreferences | null;
  activityLogs: ActivityLog[];
}

// Database indexes
export const databaseIndexes = {
  users: {
    email: 'unique',
    role: 'index',
    status: 'index',
  },
  profiles: {
    userId: 'unique',
  },
  userPreferences: {
    userId: 'unique',
  },
  activityLogs: {
    userId: 'index',
    createdAt: 'index',
  },
} as const; 