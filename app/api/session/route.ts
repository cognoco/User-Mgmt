import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/utils';
import { createSessionProvider } from '@/adapters/session/factory';

// GET /api/session - List all active sessions for the current user
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const provider = createSessionProvider({
    type: 'supabase',
    options: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    }
  });
  try {
    const sessions = await provider.listUserSessions(user.id);
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// DELETE /api/session - Revoke all sessions except current (optional, not implemented yet)
// export async function DELETE(req: NextRequest) { ... }
