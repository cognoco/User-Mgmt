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

const serviceMock = {
  getWebhook: vi.fn(),
  updateWebhook: vi.fn(),
  deleteWebhook: vi.fn(),
};
vi.mock('@/services/webhooks/factory', () => ({
  getApiWebhookService: vi.fn(() => serviceMock),
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
  const webhookId = 'test-webhook-id';
  const params = { webhookId };

  beforeEach(() => {
    serviceMock.getWebhook.mockReset();
    serviceMock.updateWebhook.mockReset();
    serviceMock.deleteWebhook.mockReset();
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

      serviceMock.getWebhook.mockResolvedValue(mockWebhook);

      const req = createMockRequest('GET');
      const response = await GET(req, { params });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockWebhook);
      
      expect(serviceMock.getWebhook).toHaveBeenCalledWith('test-user-id', webhookId);
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
      serviceMock.getWebhook.mockResolvedValue(null);

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

      serviceMock.updateWebhook.mockResolvedValue({ success: true, webhook: mockUpdatedWebhook });

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
      
      expect(serviceMock.updateWebhook).toHaveBeenCalledWith('test-user-id', webhookId, {
        name: 'Updated Webhook',
        url: 'https://example.com/updated',
        events: undefined,
        isActive: undefined,
        regenerateSecret: undefined,
      });
      
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

      serviceMock.updateWebhook.mockResolvedValue({ success: true, webhook: { ...mockUpdatedWebhook, secret: 'new-test-secret' } });

      const req = createMockRequest('PATCH', {
        regenerate_secret: true
      });

      const response = await PATCH(req, { params });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('secret', 'new-test-secret');
      
      expect(serviceMock.updateWebhook).toHaveBeenCalledWith('test-user-id', webhookId, {
        name: undefined,
        url: undefined,
        events: undefined,
        isActive: undefined,
        regenerateSecret: true,
      });
      
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

      serviceMock.getWebhook.mockResolvedValue(mockWebhookData);
      serviceMock.deleteWebhook.mockResolvedValue({ success: true });

      const req = createMockRequest('DELETE');
      const response = await DELETE(req, { params });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('message', 'Webhook deleted successfully');
      
      expect(serviceMock.getWebhook).toHaveBeenCalledWith('test-user-id', webhookId);
      expect(serviceMock.deleteWebhook).toHaveBeenCalledWith('test-user-id', webhookId);
      
      // Verify audit log was created
      expect(logUserAction).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'test-user-id',
        action: 'WEBHOOK_DELETED',
        targetResourceType: 'webhook',
        targetResourceId: webhookId
      }));
    });

    it('should return 404 if webhook is not found', async () => {
      serviceMock.getWebhook.mockResolvedValue(null);

      const req = createMockRequest('DELETE');
      const response = await DELETE(req, { params });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Webhook not found');
    });
  });
}); 