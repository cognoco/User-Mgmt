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

vi.mock('@/lib/database/supabase', () => ({
  getServiceSupabase: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  })
}));

vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn().mockResolvedValue(undefined)
}));

// Import the mocked modules directly
import { getCurrentUser } from '@/lib/auth/session';
import { getServiceSupabase } from '@/lib/database/supabase';
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
  let supabaseMock: any;

  beforeEach(() => {
    supabaseMock = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    };
    
    // Set up the mocked implementations
    (getServiceSupabase as any).mockReturnValue(supabaseMock);
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

      // Mock select response
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValue({ data: mockKeyData, error: null });

      // Mock update response
      supabaseMock.update.mockReturnThis();
      supabaseMock.eq.mockReturnValue({ error: null });

      const req = createMockRequest('DELETE');
      const params = { keyId: 'test-key-id' };
      const response = await DELETE(req, { params });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('message', 'API key revoked successfully');
      
      // Verify database was called correctly
      expect(supabaseMock.from).toHaveBeenCalledWith('api_keys');
      expect(supabaseMock.select).toHaveBeenCalled();
      expect(supabaseMock.eq).toHaveBeenCalledWith('id', 'test-key-id');
      expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      
      // Verify update was called
      expect(supabaseMock.update).toHaveBeenCalledWith({
        is_revoked: true,
        updated_at: expect.any(String)
      });
      
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
      // Mock the database response for key not found
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValue({ data: null, error: { message: 'Key not found' } });

      const req = createMockRequest('DELETE');
      const params = { keyId: 'non-existent-key' };
      const response = await DELETE(req, { params });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toHaveProperty('error', 'API key not found');
    });
  });
}); 