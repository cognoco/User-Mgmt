/* eslint-disable import/first */
// 1. Mocks MUST come first to ensure they are applied before route import

import { vi } from 'vitest';

// -- Core dependency stubs ---------------------------------------------------
vi.mock('@/services/auth/factory', () => ({
  getSessionFromToken: vi.fn().mockResolvedValue({
    id: 'current-user-id',
    app_metadata: { role: 'admin' },
  }),
}));

// Stub audit logger to avoid noise
vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn().mockResolvedValue(undefined),
}));

// Provide deterministic Prisma mocks (extends global stub from vitest.setup)
import { prisma } from '@/lib/database/prisma';
prisma.teamMember = {
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
} as any;

// ----------------------------------------------------------------------------
// Now import the route handler **after** mocks are in place
import { describe, it, expect, beforeEach } from 'vitest';
import { PATCH } from '@app/api/team/members/[memberId]/role/route';
import { callRouteWithParams } from 'tests/utils/callRoute';

const MEMBER_ID = '11111111-1111-1111-1111-111111111111';
const ADMIN_MEMBER = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  userId: 'current-user-id',
  teamId: 'team-123',
  role: 'admin',
};

const MEMBER_RECORD = {
  id: MEMBER_ID,
  userId: 'other-user',
  teamId: 'team-123',
  role: 'member',
  status: 'active',
};

const authHeaders = { authorization: 'Bearer test-token' };

vi.mock('@/middleware/withSecurity', () => ({ withSecurity: vi.fn((fn: any) => fn) }));

describe('PATCH /api/team/members/[memberId]/role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.teamMember.findUnique as any).mockResolvedValue(MEMBER_RECORD);
    (prisma.teamMember.findFirst as any).mockResolvedValue(ADMIN_MEMBER);
    (prisma.teamMember.update as any).mockResolvedValue({ ...MEMBER_RECORD, role: 'viewer' });
  });

  it('updates member role successfully', async () => {
    const res = await callRouteWithParams(
      PATCH,
      { memberId: MEMBER_ID },
      `http://localhost/api/team/members/${MEMBER_ID}/role`,
      {
        method: 'PATCH',
        body: { role: 'viewer' },
        headers: authHeaders,
      },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.role).toBe('viewer');
    expect(prisma.teamMember.update).toHaveBeenCalledWith({
      where: { id: MEMBER_ID },
      data: { role: 'viewer' },
    });
  });

  it('returns 400 for invalid role', async () => {
    const res = await callRouteWithParams(
      PATCH,
      { memberId: MEMBER_ID },
      'http://localhost',
      {
        method: 'PATCH',
        body: { role: 'invalid-role' },
        headers: authHeaders,
      },
    );
    expect(res.status).toBe(400);
  });

  it('returns 403 when current user is not admin', async () => {
    (prisma.teamMember.findFirst as any).mockResolvedValue(null);
    const res = await callRouteWithParams(
      PATCH,
      { memberId: MEMBER_ID },
      'http://localhost',
      {
        method: 'PATCH',
        body: { role: 'viewer' },
        headers: authHeaders,
      },
    );
    expect(res.status).toBe(403);
  });

  it('returns 404 when member is not found', async () => {
    (prisma.teamMember.update as any).mockRejectedValue(new Error('Not found'));
    const res = await callRouteWithParams(
      PATCH,
      { memberId: MEMBER_ID },
      'http://localhost',
      {
        method: 'PATCH',
        body: { role: 'viewer' },
        headers: authHeaders,
      },
    );
    expect(res.status).toBe(404);
  });
}); 