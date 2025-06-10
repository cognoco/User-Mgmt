import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultAdminService } from '@/services/admin/defaultAdmin.service';
import type { IAdminDataProvider } from '@/core/admin';

describe('DefaultAdminService.exportUsers', () => {
  let service: DefaultAdminService;
  let provider: IAdminDataProvider;
  beforeEach(() => {
    provider = {
      listUsers: vi.fn(),
      getUserById: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      getAuditLogs: vi.fn(),
      searchUsers: vi.fn()
    };
    service = new DefaultAdminService(provider);
  });

  it('exports csv', async () => {
    const users = [
      { id: '1', firstName: 'A', lastName: 'B', email: 'a@b.com', status: 'active', role: 'user', createdAt: '2020-01-01T00:00:00Z', lastLoginAt: null },
    ];
    provider.searchUsers = vi.fn().mockResolvedValue({ users, pagination: { page: 1, limit: 1, totalCount: 1, totalPages: 1 } });
    const result = await service.exportUsers({}, 'csv');
    expect(result.filename).toMatch(/\.csv$/);
    expect(result.data).toContain('ID');
  });

  it('exports json', async () => {
    const users = [
      { id: '1', firstName: 'A', lastName: 'B', email: 'a@b.com', status: 'active', role: 'user', createdAt: '2020-01-01T00:00:00Z', lastLoginAt: null },
    ];
    provider.searchUsers = vi.fn().mockResolvedValue({ users, pagination: { page: 1, limit: 1, totalCount: 1, totalPages: 1 } });
    const result = await service.exportUsers({}, 'json');
    expect(result.filename).toMatch(/\.json$/);
    expect(result.data).toContain('"id": "1"');
  });
});
