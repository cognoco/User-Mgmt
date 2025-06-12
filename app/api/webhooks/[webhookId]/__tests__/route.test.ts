import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PATCH, DELETE } from '@app/api/webhooks/[webhookId]/route'
import type { IWebhookService } from '@/core/webhooks'
import type { AuthService } from '@/core/auth/interfaces'
import { callRouteWithParams } from '../../../../../tests/utils/callRoute'

vi.mock('@/services/webhooks/factory', () => ({}))
vi.mock('@/services/auth/factory', () => ({}))
vi.mock('@/middleware/rateLimit', () => ({ checkRateLimit: vi.fn().mockResolvedValue(false) }))
vi.mock('@/lib/audit/auditLogger', () => ({ logUserAction: vi.fn().mockResolvedValue(undefined) }))

const service: Partial<IWebhookService> = {
  getWebhook: vi.fn(),
  updateWebhook: vi.fn(),
  deleteWebhook: vi.fn(),
}

// Create a mutable mock container that route handlers will use
const mockContainer: any = {}

// Mock the service container to avoid heavy dependency graph
vi.mock('@/lib/config/serviceContainer', () => ({
  getServiceContainer: () => mockContainer,
}))

const authService: Partial<AuthService> = {
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockContainer.webhook = service as IWebhookService
  mockContainer.auth = authService as AuthService
})

describe('webhook id route', () => {
  const webhookId = '11111111-1111-1111-1111-111111111111'
  const params = { webhookId }
  const authHeaders = { authorization: 'Bearer test-token' }

  it('returns webhook', async () => {
    (service.getWebhook as vi.Mock).mockResolvedValue({ id: webhookId, name: 'n', url: 'u', secret: 's', events: [], isActive: true, createdAt: '', updatedAt: '' });
    const res = await callRouteWithParams(GET, params, 'http://test', { headers: authHeaders })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.id).toBe(webhookId)
  }, 10_000)

  it('updates webhook', async () => {
    (service.updateWebhook as vi.Mock).mockResolvedValue({ success: true, webhook: { id: webhookId, name: 'n', url: 'u', events: [], isActive: true, createdAt: '', updatedAt: '' } });
    const res = await callRouteWithParams(PATCH, params, 'http://test', {
      method: 'PATCH',
      body: { name: 'n' },
      headers: authHeaders,
    })
    expect(res.status).toBe(200)
    expect(service.updateWebhook).toHaveBeenCalled()
  }, 10_000)

  it('deletes webhook', async () => {
    (service.getWebhook as vi.Mock).mockResolvedValue({ id: webhookId, name: 'n', url: 'u' });
    (service.deleteWebhook as vi.Mock).mockResolvedValue({ success: true });
    const res = await callRouteWithParams(DELETE, params, 'http://test', {
      method: 'DELETE',
      headers: authHeaders,
    })
    expect(res.status).toBe(200)
    expect(service.deleteWebhook).toHaveBeenCalledWith('u1', webhookId)
  }, 10_000)
})
