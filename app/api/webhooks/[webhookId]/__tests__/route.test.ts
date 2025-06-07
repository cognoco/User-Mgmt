import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PATCH, DELETE } from '@/app/api/webhooks/[webhookId]/route'63
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer'110
import type { IWebhookService } from '@/core/webhooks'
import type { AuthService } from '@/core/auth/interfaces'
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers'316

vi.mock('@/services/webhooks/factory', () => ({}))
vi.mock('@/services/auth/factory', () => ({}))
vi.mock('@/middleware/rate-limit', () => ({ checkRateLimit: vi.fn().mockResolvedValue(false) }))
vi.mock('@/lib/audit/auditLogger', () => ({ logUserAction: vi.fn().mockResolvedValue(undefined) }))

const service: Partial<IWebhookService> = {
  getWebhook: vi.fn(),
  updateWebhook: vi.fn(),
  deleteWebhook: vi.fn(),
}
const authService: Partial<AuthService> = {
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
}

beforeEach(() => {
  vi.clearAllMocks()
  resetServiceContainer()
  configureServices({ webhookService: service as IWebhookService, authService: authService as AuthService })
})

describe('webhook id route', () => {
  const params = { webhookId: 'wh_1' }

  it('returns webhook', async () => {
    (service.getWebhook as vi.Mock).mockResolvedValue({ id: 'wh_1', name: 'n', url: 'u', secret: 's', events: [], isActive: true, createdAt: '', updatedAt: '' })
    const res = await GET(createAuthenticatedRequest('GET', 'http://test'), { params })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.id).toBe('wh_1')
  })

  it('updates webhook', async () => {
    (service.updateWebhook as vi.Mock).mockResolvedValue({ success: true, webhook: { id: 'wh_1', name: 'n', url: 'u', events: [], isActive: true, createdAt: '', updatedAt: '' } })
    const req = createAuthenticatedRequest('PATCH', 'http://test', { name: 'n' })
    const res = await PATCH(req, { params })
    expect(res.status).toBe(200)
    expect(service.updateWebhook).toHaveBeenCalled()
  })

  it('deletes webhook', async () => {
    (service.getWebhook as vi.Mock).mockResolvedValue({ id: 'wh_1', name: 'n', url: 'u' })
    (service.deleteWebhook as vi.Mock).mockResolvedValue({ success: true })
    const req = createAuthenticatedRequest('DELETE', 'http://test')
    const res = await DELETE(req, { params })
    expect(res.status).toBe(200)
    expect(service.deleteWebhook).toHaveBeenCalledWith('u1', 'wh_1')
  })
})
