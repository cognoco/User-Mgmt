import { z } from 'zod';

export const feedbackCategoryEnum = z.enum(['bug', 'feature', 'general']);

export const feedbackSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  category: feedbackCategoryEnum,
  message: z.string().min(1),
  screenshotUrl: z.string().url().nullable(),
  createdAt: z.date(),
});

export type Feedback = z.infer<typeof feedbackSchema>; 