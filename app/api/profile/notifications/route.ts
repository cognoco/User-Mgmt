import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiNotificationService } from '@/services/notification/factory';
import { middleware } from '@/middleware';

const notificationPrefsSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  return middleware(['cors', 'csrf', 'rateLimit'], async (request: NextRequest) => {
    const user = (request as any).user;
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
  })(req);
}

export async function PUT(req: NextRequest) {
  return middleware(['cors', 'csrf', 'rateLimit'], async (request: NextRequest) => {
    const user = (request as any).user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
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
  })(req);
}
