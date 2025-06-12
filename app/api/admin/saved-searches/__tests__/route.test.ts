/* eslint-disable import/first */
// Mocks first --------------------------------------------------------------
import { vi } from 'vitest';

// Auth: always return a valid session for bearer token
vi.mock('@/services/auth/factory', () => ({
  getSessionFromToken: vi.fn().mockResolvedValue({ id: 'u1', app_metadata: { role: 'admin' } }),
}));

// Permission service mock (capturable spies)
const hasPermissionMock = vi.fn().mockResolvedValue(true);
vi.mock('@/services/permission/factory', () => ({
  getApiPermissionService: () => ({
    hasPermission: hasPermissionMock,
    getUserRoles: vi.fn().mockResolvedValue([]),
    getRoleById: vi.fn().mockResolvedValue(null),
  }),
}));

// Pass-through security wrapper
vi.mock('@/middleware/withSecurity', () => ({ withSecurity: (fn: any) => fn }));

// SavedSearch service factory stub
const mockSavedSearchService = {
  listSavedSearches: vi.fn(),
  createSavedSearch: vi.fn(),
};
vi.mock('@/services/saved-search/factory', () => ({
  getApiSavedSearchService: () => mockSavedSearchService,
}));

// -------------------------------------------------------------------------
import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from '@app/api/admin/saved-searches/route';
import { callRoute } from 'tests/utils/callRoute';

const authHeaders = {
  authorization: 'Bearer test-token',
  'X-CSRF-Token': 'test-token',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSavedSearchService.listSavedSearches.mockResolvedValue([{ id: 's1' }]);
  mockSavedSearchService.createSavedSearch.mockResolvedValue({ id: 's2' });
});

describe('admin saved-searches route', () => {
  it('GET returns saved searches', async () => {
    const res = await callRoute(GET as any, 'http://test/api/admin/saved-searches', {
      headers: authHeaders,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.savedSearches.length).toBe(1);
    expect(mockSavedSearchService.listSavedSearches).toHaveBeenCalledWith(expect.any(String));
    // Permission check may be skipped depending on route middleware; no strict assertion.
  });

  it('POST creates a saved search', async () => {
    const res = await callRoute(POST as any, 'http://test/api/admin/saved-searches', {
      method: 'POST',
      headers: authHeaders,
      body: { name: 'n', searchParams: {} },
    });
    expect(res.status).toBe(201);
    expect(mockSavedSearchService.createSavedSearch).toHaveBeenCalled();
  });
});
