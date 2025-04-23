import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { middleware } from '@/middleware';

const notificationPrefsSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

export const GET = middleware(['cors', 'csrf', 'rateLimit'], async (req: NextRequest) => {
  const user = (req as any).user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('notifications')
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch notification preferences' }, { status: 500 });
  }

  return NextResponse.json({ notifications: data?.notifications || {} });
});

export const PUT = middleware(['cors', 'csrf', 'rateLimit'], async (req: NextRequest) => {
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

  // Upsert user preferences (create if not exists)
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      notifications: { ...parse.data },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) {
    return NextResponse.json({ error: 'Failed to update notification preferences' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
