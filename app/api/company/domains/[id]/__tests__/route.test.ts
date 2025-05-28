import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DELETE, PATCH } from '../route';
import { getServiceSupabase } from '@/lib/database/supabase';
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';

vi.mock('@/middleware/rate-limit', () => ({ checkRateLimit: vi.fn().mockResolvedValue(false) }));
vi.mock('@/lib/database/supabase', () => {
  const client = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return { getServiceSupabase: vi.fn(() => client) };
});
vi.mock("@/middleware/auth", () => ({ withRouteAuth: vi.fn((h: any, r: any) => h(r, { userId: "user-1" })) }));

describe('Company Domain By ID API', () => {
  const id = 'domain-1';
  const ctx = { params: { id } } as any;
  let supabase: any;

  beforeEach(() => {
    supabase = getServiceSupabase();
    vi.resetAllMocks();

    supabase.from.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.update.mockReturnThis();
    supabase.delete.mockReturnThis();
    supabase.eq.mockReturnThis();
    supabase.single.mockResolvedValue({
      data: { id, is_primary: false, company_profiles: { id: 'c', user_id: 'user-1' } },
      error: null
    });
  });

  it('deletes a domain successfully', async () => {
    supabase.delete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

    const request = createAuthenticatedRequest('DELETE', `http://localhost/${id}`);
    const res = await DELETE(request, ctx);

    expect(res.status).toBe(200);
  });

  it('updates a domain successfully', async () => {
    supabase.update.mockImplementation(() => ({ eq: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { id, is_primary: true }, error: null }) }));

    const request = createAuthenticatedRequest('PATCH', `http://localhost/${id}`, { is_primary: true });
    const res = await PATCH(request, ctx);

    expect(res.status).toBe(200);
  });
});
