import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

// Validation schema for creating a new notification preference
const preferenceSchema = z.object({
  company_id: z.string().uuid('Invalid company ID format'),
  notification_type: z.enum(['new_member_domain', 'domain_verified', 'domain_verification_failed', 'security_alert']),
  enabled: z.boolean().optional(),
  channel: z.enum(['email', 'in_app', 'both']).optional(),
});

async function handleGet(_req: NextRequest, auth: AuthContext, _data: unknown, services: ServiceContainer) {
  const preferences = await services.companyNotification!.getPreferencesForUser(auth.userId!);
  return NextResponse.json({ preferences }, { status: 200 });
}

async function handlePost(_req: NextRequest, auth: AuthContext, data: z.infer<typeof preferenceSchema>, services: ServiceContainer) {
  const pref = await services.companyNotification!.createPreference(auth.userId!, {
    companyId: data.company_id,
    notificationType: data.notification_type,
    enabled: data.enabled ?? true,
    channel: data.channel ?? 'both',
  });
  return NextResponse.json(pref, { status: 200 });
}

export const GET = createApiHandler(emptySchema, handleGet, { requireAuth: true });
export const POST = createApiHandler(preferenceSchema, handlePost, { requireAuth: true });
