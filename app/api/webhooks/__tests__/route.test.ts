import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, DELETE } from '../route';
import { NextRequest } from 'next/server';
import { getApiWebhookService } from '@/services/webhooks/factory';
import { getCurrentUser } from '@/lib/auth/session';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';

vi.mock('@/services/webhooks/factory', () => ({
  getApiWebhookService: vi.fn(),
}));
vi.mock('@/lib/auth/session', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
}));
vi.mock('@/middleware/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(false),
}));
vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn().mockResolvedValue(undefined),
}));

function createRequest(method: string, body?: any) {
  return {
    method,
    headers: { get: () => null },
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe('webhooks route', () => {
  const service = {
    getWebhooks: vi.fn(),
    createWebhook: vi.fn(),
    deleteWebhook: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.mocked(getApiWebhookService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('lists webhooks', async () => {
    service.getWebhooks.mockResolvedValue([{ id: 'w1' }]);
    const res = await GET(createRequest('GET'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.webhooks[0].id).toBe('w1');
    expect(service.getWebhooks).toHaveBeenCalledWith('u1');
  });

  it('creates webhook', async () => {
    service.createWebhook.mockResolvedValue({ success: true, webhook: { id: 'w2', name: 'n', url: 'u', events: [], secret: 's', isActive: true, createdAt: '', updatedAt: '' } });
    const res = await POST(createRequest('POST', { name: 'n', url: 'u', events: [] }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('w2');
    expect(service.createWebhook).toHaveBeenCalled();
  });

  it('deletes webhook', async () => {
    service.deleteWebhook.mockResolvedValue({ success: true });
    const res = await DELETE(createRequest('DELETE', { id: 'w1' }));
    expect(res.status).toBe(200);
    expect(service.deleteWebhook).toHaveBeenCalledWith('u1', 'w1');
  });
});
