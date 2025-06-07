import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/utils';
import { getApiSessionService } from '@/services/session/factory';

// GET /api/session - List all active sessions for the current user
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const service = getApiSessionService();
  try {
    const sessions = await service!.listUserSessions(user.id);
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// DELETE /api/session - Revoke all user sessions
export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const service = getApiSessionService();
  try {
    const sessions = await service!.listUserSessions(user.id);
    let count = 0;
    for (const session of sessions) {
      const res = await service!.revokeUserSession(user.id, session.id);
      if (res.success) count += 1;
    }
    return NextResponse.json({ success: true, count });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revoke sessions' }, { status: 500 });
  }
}
