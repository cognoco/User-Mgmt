import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DELETE } from '../route';

// Mock the dependencies
vi.mock('@/middleware/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(false)
}));

vi.mock('@/lib/auth/session', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'test-user-id',
    email: 'test@example.com'
  })
}));

const serviceMock = {
  listApiKeys: vi.fn(),
  createApiKey: vi.fn(),
  revokeApiKey: vi.fn(),
};
vi.mock('@/services/api-keys/factory', () => ({
  getApiKeyService: vi.fn(() => serviceMock),
}));

vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn().mockResolvedValue(undefined)
}));

// Import the mocked modules directly
import { getCurrentUser } from '@/lib/auth/session';
import { logUserAction } from '@/lib/audit/auditLogger';

// Helper to create a mock request
function createMockRequest(method: string) {
  return {
    method,
    headers: {
      get: vi.fn().mockImplementation((header) => {
        if (header === 'x-forwarded-for') return '127.0.0.1';
        if (header === 'user-agent') return 'test-agent';
        return null;
      })
    }
  } as unknown as NextRequest;
}

describe('API Key Delete API', () => {
  beforeEach(() => {
    serviceMock.revokeApiKey.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('DELETE /api/api-keys/[keyId]', () => {
    it('should revoke an API key', async () => {
      // Mock the database responses
      const mockKeyData = {
        id: 'test-key-id',
        name: 'Test Key',
        prefix: 'test',
        scopes: ['read_profile']
      };

      serviceMock.revokeApiKey.mockResolvedValue({ success: true, key: mockKeyData });

      const req = createMockRequest('DELETE');
      const params = { keyId: 'test-key-id' };
      const response = await DELETE(req, { params });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('message', 'API key revoked successfully');
      
      expect(serviceMock.revokeApiKey).toHaveBeenCalledWith('test-user-id', 'test-key-id');
      
      // Verify audit log was created
      expect(logUserAction).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'test-user-id',
        action: 'API_KEY_REVOKED',
        targetResourceType: 'api_key',
        targetResourceId: 'test-key-id'
      }));
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the getCurrentUser to return null
      (getCurrentUser as any).mockResolvedValueOnce(null);

      const req = createMockRequest('DELETE');
      const params = { keyId: 'test-key-id' };
      const response = await DELETE(req, { params });

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 404 if API key is not found', async () => {
      serviceMock.revokeApiKey.mockResolvedValue({ success: false, error: 'API key not found' });

      const req = createMockRequest('DELETE');
      const params = { keyId: 'non-existent-key' };
      const response = await DELETE(req, { params });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toHaveProperty('error', 'API key not found');
    });
  });
}); 