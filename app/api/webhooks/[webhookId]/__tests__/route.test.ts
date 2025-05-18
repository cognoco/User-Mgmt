import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET, PATCH, DELETE } from '../route';

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
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  })
}));

vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('crypto', () => ({
  randomBytes: vi.fn(() => ({
    toString: vi.fn().mockReturnValue('new-test-secret')
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

describe('Webhook ID-specific API', () => {
  let supabaseMock: any;
  const webhookId = 'test-webhook-id';
  const params = { webhookId };

  beforeEach(() => {
    supabaseMock = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    };
    
    // Set up the mocked implementations
    (getServiceSupabase as any).mockReturnValue(supabaseMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/webhooks/[webhookId]', () => {
    it('should return a specific webhook', async () => {
      // Mock the database response
      const mockWebhook = {
        id: webhookId,
        name: 'Test Webhook',
        url: 'https://example.com/webhook',
        events: ['user_created', 'user_updated'],
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValue({ data: mockWebhook, error: null });

      const req = createMockRequest('GET');
      const response = await GET(req, { params });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockWebhook);
      
      // Verify that we called the database with the right parameters
      expect(supabaseMock.from).toHaveBeenCalledWith('webhooks');
      expect(supabaseMock.select).toHaveBeenCalled();
      expect(supabaseMock.eq).toHaveBeenCalledWith('id', webhookId);
      expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
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
      // Mock the database response for webhook not found
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValue({ data: null, error: { message: 'Webhook not found' } });

      const req = createMockRequest('GET');
      const response = await GET(req, { params });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Webhook not found');
    });
  });

  describe('PATCH /api/webhooks/[webhookId]', () => {
    it('should update a webhook', async () => {
      // Mock the database responses
      const mockWebhookData = {
        id: webhookId,
        name: 'Old Webhook Name',
        url: 'https://example.com/old-url'
      };

      const mockUpdatedWebhook = {
        id: webhookId,
        name: 'Updated Webhook',
        url: 'https://example.com/updated',
        events: ['user_created'],
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      };

      // Mock fetch response
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValueOnce({ data: mockWebhookData, error: null });

      // Mock update response
      supabaseMock.update.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValueOnce({ data: mockUpdatedWebhook, error: null });

      const req = createMockRequest('PATCH', {
        name: 'Updated Webhook',
        url: 'https://example.com/updated'
      });

      const response = await PATCH(req, { params });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('id', webhookId);
      expect(responseBody).toHaveProperty('name', 'Updated Webhook');
      expect(responseBody).toHaveProperty('url', 'https://example.com/updated');
      
      // Verify database was called correctly
      expect(supabaseMock.from).toHaveBeenCalledWith('webhooks');
      expect(supabaseMock.select).toHaveBeenCalled();
      expect(supabaseMock.eq).toHaveBeenCalledWith('id', webhookId);
      expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(supabaseMock.update).toHaveBeenCalled();
      
      // Verify audit log was created
      expect(logUserAction).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'test-user-id',
        action: 'WEBHOOK_UPDATED',
        targetResourceType: 'webhook',
        targetResourceId: webhookId
      }));
    });

    it('should regenerate webhook secret when requested', async () => {
      // Mock the database responses
      const mockWebhookData = {
        id: webhookId,
        name: 'Test Webhook',
        url: 'https://example.com/webhook'
      };

      const mockUpdatedWebhook = {
        id: webhookId,
        name: 'Test Webhook',
        url: 'https://example.com/webhook',
        events: ['user_created'],
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      };

      // Mock fetch response
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValueOnce({ data: mockWebhookData, error: null });

      // Mock update response
      supabaseMock.update.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValueOnce({ data: mockUpdatedWebhook, error: null });

      const req = createMockRequest('PATCH', {
        regenerate_secret: true
      });

      const response = await PATCH(req, { params });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('secret', 'new-test-secret');
      
      // Verify that secret was included in the update
      expect(supabaseMock.update).toHaveBeenCalledWith(expect.objectContaining({
        secret: 'new-test-secret'
      }));
      
      // Verify audit log was created with secret regeneration
      expect(logUserAction).toHaveBeenCalledWith(expect.objectContaining({
        details: expect.objectContaining({
          secret_regenerated: true
        })
      }));
    });

    it('should validate the request body', async () => {
      const req = createMockRequest('PATCH', {
        url: 'not-a-valid-url'
      });

      const response = await PATCH(req, { params });
      expect(response.status).toBe(400);
      
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Validation failed');
      expect(body).toHaveProperty('details');
      expect(Array.isArray(body.details)).toBe(true);
    });
  });

  describe('DELETE /api/webhooks/[webhookId]', () => {
    it('should delete a webhook', async () => {
      // Mock the database responses
      const mockWebhookData = {
        id: webhookId,
        name: 'Test Webhook',
        url: 'https://example.com/webhook'
      };

      // Mock fetch response
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValueOnce({ data: mockWebhookData, error: null });

      // Mock delete response
      supabaseMock.delete.mockReturnThis();
      supabaseMock.eq.mockReturnValue({ error: null });

      const req = createMockRequest('DELETE');
      const response = await DELETE(req, { params });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('message', 'Webhook deleted successfully');
      
      // Verify database was called correctly
      expect(supabaseMock.from).toHaveBeenCalledWith('webhooks');
      expect(supabaseMock.select).toHaveBeenCalled();
      expect(supabaseMock.delete).toHaveBeenCalled();
      expect(supabaseMock.eq).toHaveBeenCalledWith('id', webhookId);
      expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      
      // Verify audit log was created
      expect(logUserAction).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'test-user-id',
        action: 'WEBHOOK_DELETED',
        targetResourceType: 'webhook',
        targetResourceId: webhookId
      }));
    });

    it('should return 404 if webhook is not found', async () => {
      // Mock the database response for webhook not found
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValue({ data: null, error: { message: 'Webhook not found' } });

      const req = createMockRequest('DELETE');
      const response = await DELETE(req, { params });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Webhook not found');
    });
  });
}); 