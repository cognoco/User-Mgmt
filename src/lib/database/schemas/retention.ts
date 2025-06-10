import { z } from 'zod';
import { baseEntitySchema } from '@/types/database';

// Define retention status options
export enum RetentionStatus {
  ACTIVE = 'active',
  WARNING = 'warning',
  INACTIVE = 'inactive',
  GRACE_PERIOD = 'grace_period',
  ANONYMIZING = 'anonymizing',
  ANONYMIZED = 'anonymized',
}

// Define retention type options
export enum RetentionType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
}

// Retention record schema for users
export const retentionRecordSchema = baseEntitySchema.extend({
  userId: z.string().uuid(),
  status: z.nativeEnum(RetentionStatus).default(RetentionStatus.ACTIVE),
  retentionType: z.nativeEnum(RetentionType).default(RetentionType.PERSONAL),
  lastLoginAt: z.string().or(z.date()).optional(),
  lastActivityAt: z.string().or(z.date()).optional(),
  becomeInactiveAt: z.string().or(z.date()).optional(),
  anonymizeAt: z.string().or(z.date()).optional(),
  notifiedAt: z.record(z.string(), z.string().or(z.date())).optional(),
  exemptionReason: z.string().optional(),
  exemptedBy: z.string().uuid().optional(),
  exemptedUntil: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
});

// Retention metrics schema for reporting
export const retentionMetricsSchema = baseEntitySchema.extend({
  date: z.string().or(z.date()),
  activeUsers: z.number().int().nonnegative(),
  warningUsers: z.number().int().nonnegative(),
  inactiveUsers: z.number().int().nonnegative(),
  gracePeriodUsers: z.number().int().nonnegative(),
  anonymizingUsers: z.number().int().nonnegative(),
  anonymizedUsers: z.number().int().nonnegative(),
  personalUsers: z.number().int().nonnegative(),
  businessUsers: z.number().int().nonnegative(),
  executionTimeMs: z.number().int().nonnegative(),
  notes: z.string().optional(),
});

// Notification history schema
export const retentionNotificationSchema = baseEntitySchema.extend({
  userId: z.string().uuid(),
  type: z.enum(['warning', 'approaching_inactive', 'inactive', 'grace_period']),
  sentAt: z.string().or(z.date()),
  deliveryStatus: z.enum(['sent', 'failed', 'pending']).default('pending'),
  readAt: z.string().or(z.date()).optional(),
  responseAction: z.enum(['none', 'login', 'request_deletion']).optional(),
  responseAt: z.string().or(z.date()).optional(),
});

// Export the types
export type RetentionRecord = z.infer<typeof retentionRecordSchema>;
export type RetentionMetrics = z.infer<typeof retentionMetricsSchema>;
export type RetentionNotification = z.infer<typeof retentionNotificationSchema>; 