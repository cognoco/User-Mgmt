/* eslint-disable import/first */
import { vi } from 'vitest';

// Auth token validation
vi.mock('@/services/auth/factory', () => ({
  getSessionFromToken: vi.fn().mockResolvedValue({ id: 'u1' }),
}));

// Permission service stub (not strictly required but keeps with pattern)
vi.mock('@/services/permission/factory', () => ({
  getApiPermissionService: () => ({
    hasPermission: vi.fn().mockResolvedValue(true),
    getUserRoles: vi.fn().mockResolvedValue([]),
  }),
}));

// Resource relationship service factory
const mockService = {
  getChildResources: vi.fn(),
  getParentResources: vi.fn(),
  createRelationship: vi.fn(),
};
vi.mock('@/services/resource-relationship/factory', () => ({
  getApiResourceRelationshipService: () => mockService,
}));

// -------------------------------------------------------------------------
import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from '@app/api/resources/relationships/route';
import { callRoute } from 'tests/utils/callRoute';

const authHeaders = { authorization: 'Bearer test-token' };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('resource relationships route', () => {
  it('GET fetches children', async () => {
    mockService.getChildResources.mockResolvedValue([{ id: '1' }]);

    const res = await callRoute(GET as any, 'http://test/api/resources/relationships', {
      headers: authHeaders,
      searchParams: { parentType: 'project', parentId: 'p1' },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.relationships).toEqual([{ id: '1' }]);
    expect(mockService.getChildResources).toHaveBeenCalledWith('project', 'p1');
  });

  it('GET fetches parents', async () => {
    mockService.getParentResources.mockResolvedValue([{ id: '2' }]);

    const res = await callRoute(GET as any, 'http://test/api/resources/relationships', {
      headers: authHeaders,
      searchParams: { childType: 'task', childId: 't1' },
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.relationships).toEqual([{ id: '2' }]);
    expect(mockService.getParentResources).toHaveBeenCalledWith('task', 't1');
  });

  it('POST creates relationship', async () => {
    mockService.createRelationship.mockResolvedValue({ id: '3' });
    const payload = {
      parentType: 'project',
      parentId: 'p1',
      childType: 'task',
      childId: 't1',
    };

    const res = await callRoute(POST as any, 'http://test/api/resources/relationships', {
      method: 'POST',
      headers: { ...authHeaders, 'X-CSRF-Token': 'test-token' },
      body: payload,
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.relationship).toEqual({ id: '3' });
    expect(mockService.createRelationship).toHaveBeenCalledWith({
      ...payload,
      relationshipType: 'contains',
      createdBy: expect.any(String),
    });
  });
});
