import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '../route';

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
  getServiceSupabase: vi.fn()
}));

// Import the mocked modules directly
import { getCurrentUser } from '@/lib/auth/session';
import { getServiceSupabase } from '@/lib/database/supabase';

// Helper to create a mock request
function createMockRequest(method: string, queryParams: Record<string, string> = {}) {
  // Create a URL with query parameters
  const url = new URL('https://example.com/api/webhooks/test-webhook-id/deliveries');
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return {
    method,
    url: url.toString(),
    headers: {
      get: vi.fn().mockImplementation((header) => {
        if (header === 'x-forwarded-for') return '127.0.0.1';
        if (header === 'user-agent') return 'test-agent';
        return null;
      })
    }
  } as unknown as NextRequest;
}

describe('Webhook Deliveries API', () => {
  let supabaseMock: any;
  const webhookId = 'test-webhook-id';
  const params = { webhookId };

  beforeEach(() => {
    supabaseMock = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis()
    };
    
    // Set up the mocked implementations
    (getServiceSupabase as any).mockReturnValue(supabaseMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/webhooks/[webhookId]/deliveries', () => {
    it('should return webhook delivery history', async () => {
      // Mock the webhook fetch
      supabaseMock.single.mockResolvedValueOnce({ 
        data: { id: webhookId },
        error: null 
      });

      // Mock the deliveries fetch
      const mockDeliveries = [
        {
          id: 'delivery-1',
          event_type: 'user_created',
          payload: { id: 'user-1', name: 'Test User' },
          status_code: 200,
          response: '{"success":true}',
          error: null,
          created_at: '2023-01-01T00:00:00Z'
        },
        {
          id: 'delivery-2',
          event_type: 'user_updated',
          payload: { id: 'user-1', name: 'Updated User' },
          status_code: 500,
          response: null,
          error: 'Server error',
          created_at: '2023-01-02T00:00:00Z'
        }
      ];
      
      supabaseMock.limit.mockResolvedValueOnce({ 
        data: mockDeliveries,
        error: null 
      });

      const req = createMockRequest('GET');
      const response = await GET(req, { params });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('deliveries');
      expect(responseBody.deliveries).toEqual(mockDeliveries);
      
      // Verify webhook verification
      expect(supabaseMock.from).toHaveBeenCalledWith('webhooks');
      expect(supabaseMock.eq).toHaveBeenCalledWith('id', webhookId);
      expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      
      // Verify deliveries fetch
      expect(supabaseMock.from).toHaveBeenCalledWith('webhook_deliveries');
      expect(supabaseMock.select).toHaveBeenCalledWith(
        'id, event_type, payload, status_code, response, error, created_at'
      );
      expect(supabaseMock.eq).toHaveBeenCalledWith('webhook_id', webhookId);
      expect(supabaseMock.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(supabaseMock.limit).toHaveBeenCalledWith(10); // default limit
    });

    it('should respect the limit parameter', async () => {
      // Mock the webhook fetch
      supabaseMock.single.mockResolvedValueOnce({ 
        data: { id: webhookId },
        error: null 
      });

      // Mock the deliveries fetch
      supabaseMock.limit.mockResolvedValueOnce({ 
        data: [], // Empty for simplicity
        error: null 
      });

      const req = createMockRequest('GET', { limit: '20' });
      await GET(req, { params });
      
      // Verify limit was correctly applied
      expect(supabaseMock.limit).toHaveBeenCalledWith(20);
    });

    it('should validate the limit parameter', async () => {
      // Invalid limit (too high)
      const reqTooHigh = createMockRequest('GET', { limit: '200' });
      const responseTooHigh = await GET(reqTooHigh, { params });
      
      expect(responseTooHigh.status).toBe(400);
      const bodyTooHigh = await responseTooHigh.json();
      expect(bodyTooHigh).toHaveProperty('error', 'Invalid limit parameter. Must be between 1 and 100.');
      
      // Invalid limit (negative)
      const reqNegative = createMockRequest('GET', { limit: '-1' });
      const responseNegative = await GET(reqNegative, { params });
      
      expect(responseNegative.status).toBe(400);
      const bodyNegative = await responseNegative.json();
      expect(bodyNegative).toHaveProperty('error', 'Invalid limit parameter. Must be between 1 and 100.');
      
      // Invalid limit (not a number)
      const reqNaN = createMockRequest('GET', { limit: 'notanumber' });
      const responseNaN = await GET(reqNaN, { params });
      
      expect(responseNaN.status).toBe(400);
      const bodyNaN = await responseNaN.json();
      expect(bodyNaN).toHaveProperty('error', 'Invalid limit parameter. Must be between 1 and 100.');
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the getCurrentUser to return null
      (getCurrentUser as any).mockResolvedValueOnce(null);

      const req = createMockRequest('GET');
      const response = await GET(req, { params });

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 404 if webhook is not found', async () => {
      // Mock the webhook fetch to return not found
      supabaseMock.single.mockResolvedValueOnce({ 
        data: null,
        error: { message: 'Webhook not found' } 
      });

      const req = createMockRequest('GET');
      const response = await GET(req, { params });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Webhook not found');
    });

    it('should handle database errors when fetching deliveries', async () => {
      // Mock successful webhook fetch
      supabaseMock.single.mockResolvedValueOnce({ 
        data: { id: webhookId },
        error: null 
      });

      // Mock failed deliveries fetch
      supabaseMock.limit.mockResolvedValueOnce({ 
        data: null,
        error: { message: 'Database error' } 
      });

      const req = createMockRequest('GET');
      const response = await GET(req, { params });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Failed to fetch webhook deliveries');
    });
  });
}); 