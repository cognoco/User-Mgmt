import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import { withResourcePermission } from '@/middleware/withResourcePermission';

vi.mock('@/middleware/withResourcePermission');
vi.mock('@/middleware/with-security', () => ({ withSecurity: (fn: any) => fn }));
vi.mock('@/middleware/error-handling', () => ({ withErrorHandling: (fn: any) => fn }));
vi.mock('@/middleware/validation', () => ({ withValidation: (_s: any, fn: any) => fn }));
vi.mock('@/services/admin/factory', () => ({ getApiAdminService: () => ({ getUserById: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn() }) }));
vi.mock('@/lib/realtime/notifyUserChanges', () => ({ notifyUserChanges: vi.fn() }));

const req = new NextRequest('http://localhost');
const ctx = { params: { id: '1' } } as any;

it('uses withResourcePermission for GET', async () => {
  vi.mocked(withResourcePermission).mockImplementation((h) => async () => { await h(req as any, {} as any, ctx.params); return new Response('ok'); });
  await GET(req, ctx);
  expect(withResourcePermission).toHaveBeenCalled();
});

it('uses withResourcePermission for PUT', async () => {
  vi.mocked(withResourcePermission).mockImplementation(() => async () => new Response('ok'));
  await PUT(req, ctx);
  expect(withResourcePermission).toHaveBeenCalled();
});

it('uses withResourcePermission for DELETE', async () => {
  vi.mocked(withResourcePermission).mockImplementation((h) => async () => { await h(req as any, {} as any, ctx.params); return new Response('ok'); });
  await DELETE(req, ctx);
  expect(withResourcePermission).toHaveBeenCalled();
});
