import { z } from 'zod';
import { profileSchema } from '@/types/database';

export const personalProfileUpdateSchema = profileSchema.pick({
  bio: true,
  location: true,
  website: true,
  phoneNumber: true,
}).partial();

export const companyProfileUpdateSchema = profileSchema.pick({
  companyName: true,
  companySize: true,
  industry: true,
  companyWebsite: true,
  position: true,
  department: true,
  vatId: true,
  address: true,
}).partial();
