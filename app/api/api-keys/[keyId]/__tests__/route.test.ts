import { describe, it, expect, vi, beforeEach } from 'vitest'
// Debug start of file evaluation
console.log('[api-key-test] file loaded');

// Create stub services *before* route import so we can mock container
import type { ApiKeyService } from '@/core/api-keys/interfaces'
import type { AuthService } from '@/core/auth/interfaces'

const service: Partial<ApiKeyService> = {
  revokeApiKey: vi.fn(),
};
const authService: Partial<AuthService> = {
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
};

// Mock service container to return our stub
vi.mock('@/lib/config/serviceContainer', () => ({
  getServiceContainer: () => ({ apiKey: service, auth: authService }),
}));

// Now import route handler (after mocks registered)
import { DELETE } from '@app/api/api-keys/[keyId]/route'

import { callRouteWithParams } from '../../../../../tests/utils/callRoute'

vi.mock('@/lib/audit/auditLogger', () => ({ logUserAction: vi.fn().mockResolvedValue(undefined) }))

beforeEach(() => {
  vi.clearAllMocks();
})

describe('api key delete route', () => {
  const params = { keyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }

  it('revokes key', async () => {
    console.log('[api-key-test] starting revoke key test');
    (service.revokeApiKey as vi.Mock).mockResolvedValue({ success: true, key: { id: params.keyId, name: 'n', prefix: 'p', scopes: [], createdAt: '', isRevoked: false } });
    const res = await callRouteWithParams(DELETE as any, params, 'http://test', { method: 'DELETE', headers: { authorization: 'Bearer test-token' } })
    expect(res.status).toBe(200)
    expect(service.revokeApiKey).toHaveBeenCalledWith('u1', params.keyId)
  })
})
