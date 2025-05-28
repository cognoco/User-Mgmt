import { it, expect, vi } from 'vitest';
import { DELETE, PATCH } from '../route';
import { withResourcePermission } from '@/middleware/withResourcePermission';

vi.mock('@/middleware/withResourcePermission');
vi.mock('@/middleware/error-handling', () => ({ withErrorHandling: (fn: any) => fn }));
vi.mock('@/middleware/rate-limit', () => ({ checkRateLimit: vi.fn().mockResolvedValue(false) }));
vi.mock('@/lib/database/supabase', () => ({ getServiceSupabase: () => ({ from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { is_primary: false, company_profiles: { id: 'c', user_id: '1' } }, error: null }), update: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis() }) }));

const req = {} as any;
const ctx = { params: { id: '1' } } as any;

it('uses withResourcePermission for DELETE', async () => {
  vi.mocked(withResourcePermission).mockImplementation((h) => async () => { await h(req as any, {} as any, ctx.params); return new Response('ok'); });
  await DELETE(req, ctx);
  expect(withResourcePermission).toHaveBeenCalled();
});

it('uses withResourcePermission for PATCH', async () => {
  vi.mocked(withResourcePermission).mockImplementation((h) => async () => { await h(req as any, {} as any, ctx.params); return new Response('ok'); });
  await PATCH(req, ctx);
  expect(withResourcePermission).toHaveBeenCalled();
});
