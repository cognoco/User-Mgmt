import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { OAuthProvider } from '@/types/oauth';
import { logUserAction } from '@/lib/audit/auditLogger';
import { sendProviderLinkedNotification } from '@/lib/notifications/sendProviderLinkedNotification';

const verifySchema = z.object({
  providerId: z.nativeEnum(OAuthProvider),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerId, email } = verifySchema.parse(body);

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
        },
      },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: existing } = await supabase
      .from('account')
      .select('user_id')
      .eq('provider_email', email)
      .maybeSingle();

    if (existing && existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Email is already linked to another account.' }, { status: 409 });
    }

    await sendProviderLinkedNotification(user.id, providerId);
    await logUserAction({
      userId: user.id,
      action: 'SSO_LINK_VERIFY',
      status: 'SUCCESS',
      details: { provider: providerId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to verify provider' }, { status: 400 });
  }
}
