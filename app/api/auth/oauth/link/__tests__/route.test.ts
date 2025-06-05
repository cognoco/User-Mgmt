import { POST } from '../route';
import { OAuthProvider } from '@/types/oauth';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getApiOAuthService } from '@/services/oauth/factory';

vi.mock('@/services/oauth/factory');

const mockService = {
  linkProvider: vi.fn(),
};

const createRequest = (body: object) =>
  new Request('http://localhost/api/auth/oauth/link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/auth/oauth/link', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (getApiOAuthService as vi.Mock).mockReturnValue(mockService);
  });

  it('returns error when service fails', async () => {
    mockService.linkProvider.mockResolvedValue({ success: false, error: 'err', status: 400 });
    const res = await POST(createRequest({ provider: OAuthProvider.GITHUB, code: 'x' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'err' });
    expect(mockService.linkProvider).toHaveBeenCalledWith(OAuthProvider.GITHUB, 'x');
  });

  it('returns success data from service', async () => {
    mockService.linkProvider.mockResolvedValue({ success: true, user: { id: '1' }, linkedProviders: ['g'] });
    const res = await POST(createRequest({ provider: OAuthProvider.GITHUB, code: 'y' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, linkedProviders: ['g'], user: { id: '1' } });
  });
});
