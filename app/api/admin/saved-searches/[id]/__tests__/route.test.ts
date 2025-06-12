/* eslint-disable import/first */
import { vi } from 'vitest';

// --- Global stubs ---------------------------------------------------------
vi.mock('@/services/auth/factory', () => ({
  getSessionFromToken: vi.fn().mockResolvedValue({ id: 'u1', app_metadata: { role: 'admin' } }),
}));

const hasPermissionMock = vi.fn().mockResolvedValue(true);
vi.mock('@/services/permission/factory', () => ({
  getApiPermissionService: () => ({
    hasPermission: hasPermissionMock,
    getUserRoles: vi.fn().mockResolvedValue([]),
    getRoleById: vi.fn().mockResolvedValue(null),
  }),
}));

vi.mock('@/middleware/withSecurity', () => ({ withSecurity: (fn: any) => fn }));

const mockService = {
  getSavedSearch: vi.fn(),
  updateSavedSearch: vi.fn(),
  deleteSavedSearch: vi.fn(),
};
vi.mock('@/services/saved-search/factory', () => ({
  getApiSavedSearchService: () => mockService,
}));

// -------------------------------------------------------------------------
import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PATCH, DELETE } from '@app/api/admin/saved-searches/[id]/route';
import { callRouteWithParams } from 'tests/utils/callRoute';

const authHeaders = {
  authorization: 'Bearer test-token',
  'X-CSRF-Token': 'test-token',
};
const SEARCH_ID = '11111111-1111-1111-1111-111111111111';

beforeEach(() => {
  vi.clearAllMocks();
  mockService.getSavedSearch.mockResolvedValue({ id: SEARCH_ID, name: 'n' });
  mockService.updateSavedSearch.mockResolvedValue({ id: SEARCH_ID, name: 'n2' });
  mockService.deleteSavedSearch.mockResolvedValue(undefined);
});

describe('admin saved-search [id] route', () => {
  it('GET returns saved search', async () => {
    const res = await callRouteWithParams(
      GET as any,
      { id: SEARCH_ID },
      `http://test/api/admin/saved-searches/${SEARCH_ID}`,
      { headers: authHeaders },
    );
    expect(res.status).toBe(200);
    expect(mockService.getSavedSearch).toHaveBeenCalledWith(SEARCH_ID, expect.any(String));
    // hasPermission may not be invoked if default role check passes.
  });

  it('PATCH updates saved search', async () => {
    const res = await callRouteWithParams(
      PATCH as any,
      { id: SEARCH_ID },
      'http://test',
      {
        method: 'PATCH',
        headers: authHeaders,
        body: { name: 'n2' },
      },
    );
    expect(res.status).toBe(200);
    expect(mockService.updateSavedSearch).toHaveBeenCalled();
  });

  it('DELETE removes saved search', async () => {
    const res = await callRouteWithParams(
      DELETE as any,
      { id: SEARCH_ID },
      'http://test',
      {
        method: 'DELETE',
        headers: authHeaders,
      },
    );
    expect(res.status).toBe(204);
    expect(mockService.deleteSavedSearch).toHaveBeenCalledWith(SEARCH_ID, expect.any(String));
  });
});
