import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase';

// GET /api/session - List all active sessions for the current user
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createClient();
  try {
    // Get all sessions for the user
    const { data: sessions, error } = await supabase.auth.admin.listUserSessions(user.id);
    if (error) throw error;
    // Optionally, filter/format session info here
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// DELETE /api/session - Revoke all sessions except current (optional, not implemented yet)
// export async function DELETE(req: NextRequest) { ... }
