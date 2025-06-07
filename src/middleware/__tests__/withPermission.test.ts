import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withPermission } from '@/src/middleware/withPermission'174;
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/auth/hasPermission';

vi.mock('@/lib/auth');
vi.mock('@/lib/auth/hasPermission');

const okHandler = vi.fn(async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ ok: true });
});

describe('withPermission middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    okHandler.mockClear();
  });

  it('returns 401 when user is missing', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);
    const middleware = withPermission('TEST')(okHandler);
    const { req, res } = createMocks({ method: 'GET' });

    await middleware(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(okHandler).not.toHaveBeenCalled();
  });

  it('allows self access when enabled', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: '1' } as any);
    const middleware = withPermission('TEST', { allowSelf: true })(okHandler);
    const { req, res } = createMocks({ method: 'GET', query: { id: '1' } });

    await middleware(req, res);

    expect(okHandler).toHaveBeenCalled();
  });

  it('denies when permission check fails', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: '1' } as any);
    vi.mocked(hasPermission).mockResolvedValue(false);
    const middleware = withPermission('TEST')(okHandler);
    const { req, res } = createMocks({ method: 'GET' });

    await middleware(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(okHandler).not.toHaveBeenCalled();
  });

  it('executes handler when authorized', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: '1' } as any);
    vi.mocked(hasPermission).mockResolvedValue(true);
    const middleware = withPermission('TEST')(okHandler);
    const { req, res } = createMocks({ method: 'GET' });

    await middleware(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(okHandler).toHaveBeenCalled();
  });
});
