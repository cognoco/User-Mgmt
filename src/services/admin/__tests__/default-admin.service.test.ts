import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultAdminService } from '../default-admin.service';

vi.mock('@/lib/database/supabase', () => ({ getServiceSupabase: () => ({}) }));

describe('DefaultAdminService.exportUsers', () => {
  let service: DefaultAdminService;
  beforeEach(() => {
    service = new DefaultAdminService();
  });

  it('exports csv', async () => {
    const users = [
      { id: '1', firstName: 'A', lastName: 'B', email: 'a@b.com', status: 'active', role: 'user', createdAt: '2020-01-01T00:00:00Z', lastLoginAt: null },
    ];
    service.searchUsers = vi.fn().mockResolvedValue({ users, pagination: { page: 1, limit: 1, totalCount: 1, totalPages: 1 } }) as any;
    const result = await service.exportUsers({}, 'csv');
    expect(result.filename).toMatch(/\.csv$/);
    expect(result.data).toContain('ID');
  });

  it('exports json', async () => {
    const users = [
      { id: '1', firstName: 'A', lastName: 'B', email: 'a@b.com', status: 'active', role: 'user', createdAt: '2020-01-01T00:00:00Z', lastLoginAt: null },
    ];
    service.searchUsers = vi.fn().mockResolvedValue({ users, pagination: { page: 1, limit: 1, totalCount: 1, totalPages: 1 } }) as any;
    const result = await service.exportUsers({}, 'json');
    expect(result.filename).toMatch(/\.json$/);
    expect(result.data).toContain('"id": "1"');
  });
});
