import { describe, it, expect, vi } from 'vitest';
import { createMockMiddleware } from '@/tests/factories/mockMiddleware';

// Basic tests to verify middleware factory behavior

describe('createMockMiddleware', () => {
  it('withSecurity returns the same handler', () => {
    const { withSecurity } = createMockMiddleware();
    const handler = vi.fn();
    const wrapped = withSecurity(handler);
    expect(wrapped).toBe(handler);
    expect(withSecurity).toHaveBeenCalledWith(handler);
  });

  it('withAuthRateLimit returns the same handler', () => {
    const { withAuthRateLimit } = createMockMiddleware();
    const handler = vi.fn();
    const req = {} as any;
    const wrapped = withAuthRateLimit(req, handler);
    expect(wrapped).toBe(handler);
    expect(withAuthRateLimit).toHaveBeenCalledWith(req, handler);
  });

  it('routeAuthMiddleware injects userId', async () => {
    const { routeAuthMiddleware } = createMockMiddleware();
    const handler = vi.fn().mockResolvedValue('ok');
    const middleware = routeAuthMiddleware();
    const result = await middleware(handler)({} as any, undefined as any, { data: 1 });
    expect(handler).toHaveBeenCalledWith({}, { userId: 'u1' }, { data: 1 });
    expect(result).toBe('ok');
  });

  it('checkRateLimit resolves to false', async () => {
    const { checkRateLimit } = createMockMiddleware();
    await expect(checkRateLimit()).resolves.toBe(false);
  });
});
