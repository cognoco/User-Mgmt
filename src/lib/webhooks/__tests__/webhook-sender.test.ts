import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { sendWebhookEvent, getWebhookDeliveries } from '../webhook-sender';
import crypto from 'crypto';

// Mock fetch
global.fetch = vi.fn();

// Mock crypto
vi.mock('crypto', () => ({
  createHmac: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mocked-signature')
  })
}));

// Mock dependencies
vi.mock('@/lib/database/supabase', () => ({
  getServiceSupabase: vi.fn()
}));

// Import the mocked supabase directly
import { getServiceSupabase } from '@/adapters/database/supabase-provider';

describe('Webhook Sender', () => {
  let supabaseMock: any;
  
  beforeEach(() => {
    // Reset fetch mock
    (global.fetch as any).mockReset();
    
    // Create a more flexible mock for Supabase that properly handles chaining
    supabaseMock = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis()
    };
    
    // Set up the mocked implementation
    (getServiceSupabase as any).mockReturnValue(supabaseMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendWebhookEvent', () => {
    it('should fetch webhooks subscribed to the event type', async () => {
      // Configure the mock for this specific test case
      // The last method in the chain should return the resolved value
      supabaseMock.eq.mockResolvedValueOnce({ data: [], error: null });

      await sendWebhookEvent('user_created', { id: 'user-1' });
      
      expect(supabaseMock.from).toHaveBeenCalledWith('webhooks');
      expect(supabaseMock.select).toHaveBeenCalledWith('id, url, secret');
      expect(supabaseMock.contains).toHaveBeenCalledWith('events', ['user_created']);
      expect(supabaseMock.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('should filter webhooks by user ID when provided', async () => {
      // The last method in the chain should return the resolved value
      supabaseMock.eq.mockResolvedValueOnce({ data: [], error: null });

      await sendWebhookEvent('user_created', { id: 'user-1' }, 'test-user-id');
      
      expect(supabaseMock.from).toHaveBeenCalledWith('webhooks');
      expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
    });

    it('should send a webhook to each configured endpoint', async () => {
      // Mock successful fetch of webhooks
      const mockWebhooks = [
        { id: 'webhook-1', url: 'https://endpoint1.com', secret: 'secret1' },
        { id: 'webhook-2', url: 'https://endpoint2.com', secret: 'secret2' }
      ];
      
      // For the query, the last eq() call should return the resolved value
      supabaseMock.eq.mockResolvedValueOnce({ data: mockWebhooks, error: null });
      
      // For the insert calls, they will return success
      supabaseMock.insert.mockResolvedValue({ error: null });
      
      // Mock successful HTTP responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '{"received":true}'
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          text: async () => 'Accepted'
        });

      const eventType = 'user_created';
      const payload = { id: 'user-1', name: 'Test User' };
      
      const results = await sendWebhookEvent(eventType, payload);
      
      // Should have two successful results
      expect(results.length).toBe(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      
      // Should have made two fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // Verify first fetch call
      expect(global.fetch).toHaveBeenCalledWith('https://endpoint1.com', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Webhook-Signature': 'mocked-signature',
          'X-Webhook-Event': eventType
        })
      }));
      
      // Verify payload content in first fetch call
      const [, options1] = (global.fetch as any).mock.calls[0];
      const body1 = JSON.parse(options1.body);
      expect(body1).toEqual({
        event: eventType,
        data: payload
      });
      
      // Verify second fetch call
      expect(global.fetch).toHaveBeenCalledWith('https://endpoint2.com', expect.any(Object));
    });

    it('should sign the payload with the webhook secret', async () => {
      // Mock successful fetch of one webhook
      supabaseMock.eq.mockResolvedValueOnce({
        data: [{ id: 'webhook-1', url: 'https://endpoint.com', secret: 'test-secret' }],
        error: null
      });
      
      // For the insert call
      supabaseMock.insert.mockResolvedValue({ error: null });
      
      // Mock successful HTTP response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '{"received":true}'
      });

      await sendWebhookEvent('user_created', { id: 'user-1' });
      
      // Verify signature generation
      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', 'test-secret');
    });

    it('should record delivery success in the database', async () => {
      // Mock successful fetch of one webhook
      supabaseMock.eq.mockResolvedValueOnce({
        data: [{ id: 'webhook-1', url: 'https://endpoint.com', secret: 'test-secret' }],
        error: null
      });
      
      // Mock successful HTTP response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '{"received":true}'
      });
      
      // Mock successful insert
      supabaseMock.insert.mockResolvedValue({ error: null });

      await sendWebhookEvent('user_created', { id: 'user-1' });
      
      // Verify record creation
      expect(supabaseMock.from).toHaveBeenCalledWith('webhook_deliveries');
      expect(supabaseMock.insert).toHaveBeenCalledWith(expect.objectContaining({
        webhook_id: 'webhook-1',
        event_type: 'user_created',
        status_code: 200,
        response: '{"received":true}'
      }));
    });

    it('should handle webhook delivery failures', async () => {
      // Mock successful fetch of one webhook
      supabaseMock.eq.mockResolvedValueOnce({
        data: [{ id: 'webhook-1', url: 'https://endpoint.com', secret: 'test-secret' }],
        error: null
      });
      
      // Mock failed HTTP response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });
      
      // Mock successful insert
      supabaseMock.insert.mockResolvedValue({ error: null });

      const results = await sendWebhookEvent('user_created', { id: 'user-1' });
      
      // Should have one failed result
      expect(results.length).toBe(1);
      expect(results[0].success).toBe(false);
      expect(results[0].statusCode).toBe(500);
      
      // Verify error is recorded
      expect(supabaseMock.insert).toHaveBeenCalledWith(expect.objectContaining({
        webhook_id: 'webhook-1',
        event_type: 'user_created',
        status_code: 500,
        response: 'Internal Server Error',
        error: 'Failed with status: 500'
      }));
    });

    it('should handle network errors during webhook delivery', async () => {
      // Mock successful fetch of one webhook
      supabaseMock.eq.mockResolvedValueOnce({
        data: [{ id: 'webhook-1', url: 'https://endpoint.com', secret: 'test-secret' }],
        error: null
      });
      
      // Mock network error
      const networkError = new Error('Network error');
      (global.fetch as any).mockRejectedValue(networkError);
      
      // Mock successful insert
      supabaseMock.insert.mockResolvedValue({ error: null });

      const results = await sendWebhookEvent('user_created', { id: 'user-1' });
      
      // Should have one failed result
      expect(results.length).toBe(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Network error');
      
      // Verify error is recorded
      expect(supabaseMock.insert).toHaveBeenCalledWith(expect.objectContaining({
        webhook_id: 'webhook-1',
        event_type: 'user_created',
        error: 'Network error'
      }));
    });

    it('should return empty array if no webhooks found', async () => {
      // Mock no webhooks found
      supabaseMock.eq.mockResolvedValueOnce({ data: null, error: null });

      const results = await sendWebhookEvent('user_created', { id: 'user-1' });
      
      expect(results).toEqual([]);
    });

    it('should return empty array if database error occurs', async () => {
      // Mock database error
      supabaseMock.eq.mockResolvedValueOnce({ 
        data: null,
        error: { message: 'Database error' } 
      });

      const results = await sendWebhookEvent('user_created', { id: 'user-1' });
      
      expect(results).toEqual([]);
    });
  });

  describe('getWebhookDeliveries', () => {
    it('should fetch delivery history for a webhook', async () => {
      // Mock delivery history
      const mockDeliveries = [
        {
          id: 'delivery-1',
          event_type: 'user_created',
          status_code: 200,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];
      
      // The last method in the chain should return the resolved value
      supabaseMock.limit.mockResolvedValueOnce({ data: mockDeliveries, error: null });

      const webhookId = 'webhook-1';
      const deliveries = await getWebhookDeliveries(webhookId);
      
      expect(deliveries).toEqual(mockDeliveries);
      
      // Verify database query
      expect(supabaseMock.from).toHaveBeenCalledWith('webhook_deliveries');
      expect(supabaseMock.select).toHaveBeenCalledWith('id, event_type, status_code, created_at, error');
      expect(supabaseMock.eq).toHaveBeenCalledWith('webhook_id', webhookId);
      expect(supabaseMock.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(supabaseMock.limit).toHaveBeenCalledWith(10); // default limit
    });

    it('should respect custom limit', async () => {
      // Mock delivery history (empty for simplicity)
      supabaseMock.limit.mockResolvedValueOnce({ data: [], error: null });

      await getWebhookDeliveries('webhook-1', 20);
      
      // Verify limit used
      expect(supabaseMock.limit).toHaveBeenCalledWith(20);
    });

    it('should return empty array if database error occurs', async () => {
      // Mock database error
      supabaseMock.limit.mockResolvedValueOnce({ 
        data: null,
        error: { message: 'Database error' } 
      });

      const deliveries = await getWebhookDeliveries('webhook-1');
      
      expect(deliveries).toEqual([]);
    });
  });
}); 