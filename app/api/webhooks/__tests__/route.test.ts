import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET, POST, DELETE } from '../route';

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
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  })
}));

vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('crypto', () => ({
  randomBytes: vi.fn(() => ({
    toString: vi.fn().mockReturnValue('test-secret')
  }))
}));

// Import the mocked modules directly
import { getCurrentUser } from '@/lib/auth/session';
import { getServiceSupabase } from '@/lib/database/supabase';
import { logUserAction } from '@/lib/audit/auditLogger';

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

describe('Webhooks API', () => {
  let supabaseMock: any;

  beforeEach(() => {
    supabaseMock = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    };
    
    // Set up the mocked implementations
    (getServiceSupabase as any).mockReturnValue(supabaseMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/webhooks', () => {
    it('should return a list of webhooks for the current user', async () => {
      // Mock the database response
      const mockWebhooks = [
        {
          id: 'webhook1',
          name: 'Test Webhook 1',
          url: 'https://example.com/webhook1',
          events: ['user_created', 'user_updated'],
          is_active: true,
          created_at: '2023-01-01T00:00:00Z'
        },
        {
          id: 'webhook2',
          name: 'Test Webhook 2',
          url: 'https://example.com/webhook2',
          events: ['payment_succeeded'],
          is_active: false,
          created_at: '2023-01-02T00:00:00Z'
        }
      ];

      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnValue({ data: mockWebhooks, error: null });

      const req = createMockRequest('GET');
      const response = await GET(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('webhooks');
      expect(Array.isArray(responseBody.webhooks)).toBe(true);
      
      // Verify that we called the database with the right parameters
      expect(supabaseMock.from).toHaveBeenCalledWith('webhooks');
      expect(supabaseMock.select).toHaveBeenCalled();
      expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
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

  describe('POST /api/webhooks', () => {
    it('should create a new webhook', async () => {
      // Mock the successful insert
      const mockInsertResponse = {
        data: {
          id: 'new-webhook-id',
          name: 'My Webhook',
          url: 'https://example.com/webhook',
          events: ['user_created'],
          is_active: true,
          created_at: '2023-01-01T00:00:00Z'
        },
        error: null
      };

      supabaseMock.insert.mockReturnThis();
      supabaseMock.select.mockReturnThis();
      supabaseMock.single.mockResolvedValue(mockInsertResponse);

      const req = createMockRequest('POST', {
        name: 'My Webhook',
        url: 'https://example.com/webhook',
        events: ['user_created']
      });

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('id', 'new-webhook-id');
      expect(responseBody).toHaveProperty('name', 'My Webhook');
      expect(responseBody).toHaveProperty('url', 'https://example.com/webhook');
      expect(responseBody).toHaveProperty('events');
      expect(responseBody).toHaveProperty('secret', 'test-secret');
      
      // Verify database was called correctly
      expect(supabaseMock.from).toHaveBeenCalledWith('webhooks');
      expect(supabaseMock.insert).toHaveBeenCalled();
      
      // Verify audit log was created
      expect(logUserAction).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'test-user-id',
        action: 'WEBHOOK_CREATED',
        targetResourceType: 'webhook'
      }));
    });

    it('should validate the request body', async () => {
      const req = createMockRequest('POST', {
        // Missing required name field
        url: 'https://example.com/webhook',
        events: ['user_created']
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Validation failed');
      expect(body).toHaveProperty('details');
      expect(Array.isArray(body.details)).toBe(true);
    });

    it('should validate the URL format', async () => {
      const req = createMockRequest('POST', {
        name: 'Invalid URL Webhook',
        url: 'not-a-valid-url',
        events: ['user_created']
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Validation failed');
      
      const urlError = body.details.find((error: any) => 
        error.field === 'url'
      );
      expect(urlError).toBeDefined();
    });
  });
}); 
  describe('DELETE /api/webhooks', () => {
    it('should delete a webhook', async () => {
      supabaseMock.delete = vi.fn().mockReturnThis();
      supabaseMock.single.mockResolvedValue({});
      supabaseMock.eq.mockReturnThis();
      supabaseMock.from.mockReturnThis();
      supabaseMock.delete.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.select = vi.fn();
      supabaseMock.insert = vi.fn();

      const req = createMockRequest('DELETE', { id: 'webhook1' });
      const response = await DELETE(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toHaveProperty('success', true);
    });
  });
});

export {};
