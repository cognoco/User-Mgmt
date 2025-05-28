import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';

vi.mock('@/middleware/createMiddlewareChain', async () => {
  const actual = await vi.importActual<any>('@/middleware/createMiddlewareChain');
  return {
    ...actual,
    routeAuthMiddleware: () => (handler: any) =>
      (req: any, ctx?: any, data?: any) =>
        handler(req, { userId: 'u1', role: 'admin', permissions: ['admin.users.view','admin.users.update','admin.users.delete','admin.users.list'] }, data),
  };
});
vi.mock('@/middleware/with-security', () => ({ withSecurity: (fn: any) => fn }));
vi.mock('@/middleware/error-handling', () => ({ withErrorHandling: (fn: any) => fn }));
vi.mock('@/middleware/validation', () => ({ withValidation: (_s: any, fn: any) => fn }));
vi.mock('@/services/admin/factory', () => ({ getApiAdminService: () => ({ getUserById: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn() }) }));
vi.mock('@/lib/realtime/notifyUserChanges', () => ({ notifyUserChanges: vi.fn() }));

const req = new NextRequest('http://localhost');
const ctx = { params: { id: '1' } } as any;

it('calls auth middleware for GET', async () => {
  await GET(req, ctx);
  expect(authMw).toHaveBeenCalled();
});

it('calls auth middleware for PUT', async () => {
  await PUT(req, ctx);
  expect(authMw).toHaveBeenCalled();
});

it('calls auth middleware for DELETE', async () => {
  await DELETE(req, ctx);
  expect(authMw).toHaveBeenCalled();
});
