import { z } from 'zod';
import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api/routeHelpers';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';
import { createCreatedResponse, createValidationError, createForbiddenError, createUnauthorizedError, createServerError } from '@/lib/api/common';

// Validation schema for adding a new recipient
const recipientSchema = z.object({
  company_id: z.string().uuid('Invalid company ID format'),
  preference_id: z.string().uuid('Invalid preference ID format').optional(),
  email: z.string().email('Invalid email address'),
  is_admin: z.boolean().default(false),
});

// POST /api/company/notifications/recipients - Add a new notification recipient
async function handlePost(
  _req: NextRequest,
  auth: AuthContext,
  data: z.infer<typeof recipientSchema>,
  services: ServiceContainer
) {
  const result = await services.companyNotification!.addRecipient(auth.userId!, {
    companyId: data.company_id,
    preferenceId: data.preference_id ?? undefined,
    email: data.email,
    isAdmin: data.is_admin,
  });
  return createCreatedResponse({ recipients: result.recipients, message: 'Recipient added successfully' });
}

export const POST = createApiHandler(
  recipientSchema as z.ZodType<z.infer<typeof recipientSchema>>,
  handlePost,
  { requireAuth: true }
);
