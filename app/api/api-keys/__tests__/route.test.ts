import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '../route';

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

const providerMock = {
  listKeys: vi.fn(),
  createKey: vi.fn(),
  revokeKey: vi.fn()
};
vi.mock('@/adapters/api-keys/factory', () => ({
  createSupabaseApiKeyProvider: vi.fn(() => providerMock)
}));

vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn().mockResolvedValue(undefined)
}));


// Import the mocked modules directly
import { getCurrentUser } from '@/lib/auth/session';

// Helper to create a mock request
function createMockRequest(method: string, body?: any) {
  return {
    method,
    headers: {
      get: vi.fn().mockImplementation((header) => {
        if (header === 'x-forwarded-for') return '127.0.0.1';
        if (header === 'user-agent') return 'test-agent';
        return null;
      })
    },
    json: vi.fn().mockResolvedValue(body)
  } as unknown as NextRequest;
}

describe('API Keys API', () => {
  beforeEach(() => {
    providerMock.listKeys.mockReset();
    providerMock.createKey.mockReset();
    providerMock.revokeKey.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/api-keys', () => {
    it('should return a list of API keys for the current user', async () => {
      // Mock the database response
      const mockApiKeys = [
        {
          id: 'key1',
          name: 'Test Key 1',
          prefix: 'test1',
          scopes: ['read_profile'],
          expires_at: null,
          created_at: '2023-01-01T00:00:00Z'
        },
        {
          id: 'key2',
          name: 'Test Key 2',
          prefix: 'test2',
          scopes: ['read_profile', 'write_profile'],
          expires_at: '2024-01-01T00:00:00Z',
          created_at: '2023-01-02T00:00:00Z'
        }
      ];

      providerMock.listKeys.mockResolvedValue(mockApiKeys);

      const req = createMockRequest('GET');
      const response = await GET(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('keys');
      expect(Array.isArray(responseBody.keys)).toBe(true);
      
      expect(providerMock.listKeys).toHaveBeenCalledWith('test-user-id');
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the getCurrentUser to return null
      (getCurrentUser as any).mockResolvedValueOnce(null);

      const req = createMockRequest('GET');
      const response = await GET(req);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('POST /api/api-keys', () => {
    it('should create a new API key', async () => {
      // Mock the successful insert
      const mockInsertResponse = {
        data: {
          id: 'new-key-id',
          name: 'My API Key',
          prefix: 'test',
          scopes: ['read_profile'],
          expires_at: null,
          created_at: '2023-01-01T00:00:00Z'
        },
        error: null
      };

      providerMock.createKey.mockResolvedValue({
        success: true,
        key: mockInsertResponse.data,
        plaintext: 'test_generatedkey123'
      });

      const req = createMockRequest('POST', {
        name: 'My API Key',
        scopes: ['read_profile']
      });

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('id', 'new-key-id');
      expect(responseBody).toHaveProperty('name', 'My API Key');
      expect(responseBody).toHaveProperty('scopes');
      expect(responseBody).toHaveProperty('key', 'test_generatedkey123');
      
      expect(providerMock.createKey).toHaveBeenCalledWith('test-user-id', {
        name: 'My API Key',
        scopes: ['read_profile'],
        expiresAt: undefined
      });
    });

    it('should validate the request body', async () => {
      const req = createMockRequest('POST', {
        // Missing required name field
        scopes: ['read_profile']
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Validation failed');
      expect(body).toHaveProperty('details');
      expect(Array.isArray(body.details)).toBe(true);
    });
  });
}); 