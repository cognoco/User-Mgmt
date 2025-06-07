import { z } from 'zod';
import { UserType, companySchema } from '@/types/userType';

// Extend the user schema to include user type and company information
export const userSchema = z.object({
  id: z.string().or(z.number()),
  email: z.string().email(),
  username: z.string().min(3).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  userType: z.nativeEnum(UserType).default(UserType.PRIVATE),
  company: companySchema.optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
  lastLogin: z.string().or(z.date()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type User = z.infer<typeof userSchema>; 
export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, any>;
}
