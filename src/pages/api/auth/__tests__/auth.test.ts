import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../[...auth]';
import { getApiAuthService } from '@/services/auth/factory';
import { testPost } from '@/tests/utils/api-testing-utils';

vi.mock('@/services/auth/factory', () => ({ getApiAuthService: vi.fn() }));

describe('POST /api/auth/login', () => {
  const mockService = { login: vi.fn(), logout: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as vi.Mock).mockReturnValue(mockService);
    mockService.login.mockResolvedValue({ success: true, user: { id: '1' }, token: 't', expiresAt: 'x' });
  });

  it('returns 200 on success', async () => {
    const { status, data } = await testPost(handler, { email: 'a@b.com', password: 'p' }, { query: { auth: ['login'] } });
    expect(status).toBe(200);
    expect(data.data.user.id).toBe('1');
  });

  it('validates body', async () => {
    const { status } = await testPost(handler, { email: 'bad' }, { query: { auth: ['login'] } });
    expect(status).toBe(400);
  });
});
