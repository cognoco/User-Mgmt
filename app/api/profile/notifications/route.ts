import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiNotificationService } from '@/services/notification/factory';
import { withSecurity } from '@/middleware/withSecurity';

const notificationPrefsSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

export const GET = withSecurity(async (req: NextRequest) => {
  const user = (req as any).user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const service = getApiNotificationService();
  let preferences;
  try {
    preferences = await service.getUserPreferences(user.id);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notification preferences' }, { status: 500 });
  }
  return NextResponse.json({ notifications: preferences });
});

export const PUT = withSecurity(async (req: NextRequest) => {
  const user = (req as any).user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parse = notificationPrefsSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid notification preferences', details: parse.error.errors }, { status: 400 });
  }

  const service = getApiNotificationService();
  try {
    await service.updateUserPreferences(user.id, parse.data);
  } catch {
    return NextResponse.json({ error: 'Failed to update notification preferences' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
