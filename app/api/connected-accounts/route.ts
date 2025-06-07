import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/lib/database/prisma';
import { connectedAccountSchema } from '@/types/connectedAccounts'163;

// GET /api/connected-accounts - fetch all connected accounts for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const accounts = await prisma.account.findMany({
      where: { user_id: user.id },
      orderBy: { createdAt: 'asc' },
    });
    // Validate and map to API shape
    const safeAccounts = accounts.map((a: any) => connectedAccountSchema.parse({
      id: a.id,
      userId: a.user_id,
      provider: a.provider,
      providerUserId: a.provider_account_id,
      email: a.provider_email,
      displayName: a.displayName || undefined,
      avatarUrl: a.avatarUrl || undefined,
      accessToken: a.accessToken || undefined,
      refreshToken: a.refreshToken || undefined,
      expiresAt: a.expiresAt ? a.expiresAt.toISOString() : undefined,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
    return NextResponse.json(safeAccounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch connected accounts' }, { status: 500 });
  }
}

// DELETE /api/connected-accounts/[accountId] - disconnect a provider
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(request.url);
    const accountId = url.pathname.split('/').pop();
    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }
    // Ensure the account belongs to the user
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account || account.user_id !== user.id) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    await prisma.account.delete({ where: { id: accountId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to disconnect account' }, { status: 500 });
  }
} 