import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase';

// DELETE /api/session/:sessionId - Revoke a specific session for the current user
export async function DELETE(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { sessionId } = params;
  const supabase = createClient();
  try {
    // Revoke the session for the user
    const { error } = await supabase.auth.admin.deleteUserSession(user.id, sessionId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
  }
}
