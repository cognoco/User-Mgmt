// Set required environment variables for rate limiting BEFORE any imports
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.REDIS_TOKEN = 'dummy-token';

import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import { type UpstashResponse } from '@upstash/redis';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('@upstash/redis', () => {
  const createResponse = (value: number): UpstashResponse<number> => ({
    result: value,
    error: undefined,
  });
  // Use a singleton multiMock for all Redis instances
  const multiMock = {
    zremrangebyscore: vi.fn().mockReturnThis(),
    zadd: vi.fn().mockReturnThis(),
    zcount: vi.fn().mockReturnThis(),
    expire: vi.fn().mockReturnThis(),
    exec: vi.fn(),
  };
  // Global setter for exec implementation
  (globalThis as any).__multiExecMockImpl = (globalThis as any).__multiExecMockImpl || (async () => [
    createResponse(0),
    createResponse(1),
    createResponse(0),
    createResponse(1),
  ]);
  multiMock.exec.mockImplementation(function (...args: any[]) {
    // Always call the latest value of globalThis.__multiExecMockImpl
    return (typeof (globalThis as any).__multiExecMockImpl === 'function')
      ? (globalThis as any).__multiExecMockImpl(...args)
      : Promise.resolve([
          createResponse(0),
          createResponse(1),
          createResponse(0),
          createResponse(1),
        ]);
  });
  const RedisMock = vi.fn(() => ({
    multi: () => multiMock,
  }));
  (RedisMock as any).multiMock = multiMock;
  return {
    Redis: RedisMock,
  };
});

// Mock NextRequest and NextApiRequest
const mockNextReq = (ip = '127.0.0.1', headers: Record<string, string> = {}) => ({
  ip,
  headers: {
    get: (key: string) => headers[key.toLowerCase()] || headers[key],
    ...headers,
  },
}) as unknown as NextRequest;

const mockApiReq = (ip = '127.0.0.1', headers: Record<string, string> = {}) => ({
  socket: { remoteAddress: ip },
  headers: {
    get: (key: string) => headers[key.toLowerCase()] || headers[key],
    ...headers,
  },
}) as unknown as NextApiRequest;

const mockRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
    getHeader: vi.fn(),
    headers: new Map(),
  } as unknown as NextApiResponse;
  return res;
};

describe('Rate Limiting', () => {
  let next: () => Promise<void>;
  let rateLimit: typeof import('@/middleware/rate-limit').rateLimit;
  let checkRateLimit: typeof import('@/middleware/rate-limit').checkRateLimit;
  let multiMock: any;

  beforeEach(async () => {
    vi.resetModules();
    multiMock = ((await import('@upstash/redis')) as any).Redis.multiMock;
    // Reset all mock methods
    Object.values(multiMock).forEach(fn => (fn as any).mockReset && (fn as any).mockReset());
    // Always use the global exec mock for every test
    multiMock.exec.mockImplementation(function (...args: any[]) {
      return (typeof (globalThis as any).__multiExecMockImpl === 'function')
        ? (globalThis as any).__multiExecMockImpl(...args)
        : Promise.resolve([
            { result: 0, error: undefined },
            { result: 1, error: undefined },
            { result: 0, error: undefined },
            { result: 1, error: undefined },
          ]);
    });
    // Default: allow requests (0 hits)
    (globalThis as any).__multiExecMockImpl = async () => [
      { result: 0, error: undefined },
      { result: 1, error: undefined },
      { result: 0, error: undefined },
      { result: 1, error: undefined },
    ];
    next = vi.fn().mockResolvedValue(undefined);
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.REDIS_TOKEN = 'dummy-token';
    const mod = await import('@/middleware/rate-limit');
    rateLimit = mod.rateLimit;
    checkRateLimit = mod.checkRateLimit;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', async () => {
      const req = mockNextReq();
      // Set the global exec mock to allow (5 < 10)
      (globalThis as any).__multiExecMockImpl = async () => [
        { result: 0, error: undefined },
        { result: 1, error: undefined },
        { result: 5, error: undefined },  // 5 requests in window
        { result: 1, error: undefined },
      ];
      const isLimited = await checkRateLimit(req, { max: 10 });
      expect(isLimited).toBe(false);
    });

    it('should block requests exceeding rate limit', async () => {
      const req = mockNextReq();
      // Set the global exec mock to block (15 > 10)
      (globalThis as any).__multiExecMockImpl = async () => [
        { result: 0, error: undefined },
        { result: 1, error: undefined },
        { result: 15, error: undefined },  // 15 requests in window
        { result: 1, error: undefined },
      ];
      const isLimited = await checkRateLimit(req, { max: 10 });
      expect(isLimited).toBe(true);
    });

    it('should use IP address for rate limit key', async () => {
      const ip = '192.168.1.1';
      const req = mockNextReq(ip);

      await checkRateLimit(req);

      expect(multiMock.zadd).toHaveBeenCalledWith(
        expect.stringContaining(ip),
        expect.any(Object)
      );
    });

    it('should use x-forwarded-for header when IP is not available', async () => {
      const forwardedIp = '10.0.0.1';
      // Create a request object without an 'ip' property
      const req = {
        headers: {
          get: (key: string) => ({ 'x-forwarded-for': forwardedIp }[key.toLowerCase()]),
        },
      } as unknown as NextRequest;
      multiMock.exec.mockResolvedValue([
        { result: 0, error: undefined },
        { result: 1, error: undefined },
        { result: 5, error: undefined },
        { result: 1, error: undefined },
      ]);

      await checkRateLimit(req);

      expect(multiMock.zadd).toHaveBeenCalledWith(
        expect.stringContaining(forwardedIp),
        expect.any(Object)
      );
    });

    it('should clean up old entries before checking limit', async () => {
      const req = mockNextReq();
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutes

      await checkRateLimit(req, { windowMs });

      expect(multiMock.zremrangebyscore).toHaveBeenCalledWith(
        expect.any(String),
        0,
        now - windowMs
      );
    });
  });

  describe('Rate Limit Middleware', () => {
    it('should allow requests within limit', async () => {
      const req = mockApiReq();
      const res = mockRes();
      const middleware = rateLimit({ max: 10 });
      // Set the global exec mock to allow (5 < 10)
      (globalThis as any).__multiExecMockImpl = async () => [
        { result: 0, error: undefined },
        { result: 1, error: undefined },
        { result: 5, error: undefined },  // 5 requests
        { result: 1, error: undefined },
      ];
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(429);
    });

    it('should block requests exceeding limit', async () => {
      const req = mockApiReq();
      const res = mockRes();
      const middleware = rateLimit({ max: 10 });
      // Set the global exec mock to block (15 > 10)
      (globalThis as any).__multiExecMockImpl = async () => [
        { result: 0, error: undefined },
        { result: 1, error: undefined },
        { result: 15, error: undefined },  // 15 requests
        { result: 1, error: undefined },
      ];
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Too many requests, please try again later.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should add rate limit headers', async () => {
      const req = mockApiReq();
      const res = mockRes();
      const middleware = rateLimit({ max: 10 });
      vi.mocked(multiMock.exec).mockResolvedValueOnce([
        { result: 0, error: undefined },
        { result: 1, error: undefined },
        { result: 5, error: undefined },  // 5 requests
        { result: 1, error: undefined },
      ]);

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      const req = mockApiReq();
      const res = mockRes();
      const middleware = rateLimit({ max: 10 });
      vi.mocked(multiMock.exec).mockRejectedValueOnce(new Error('Redis error'));

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled(); // Should still allow request
    });

    it('should use custom window size', async () => {
      const req = mockApiReq();
      const res = mockRes();
      const customWindow = 30 * 60 * 1000; // 30 minutes
      const middleware = rateLimit({ windowMs: customWindow });

      await middleware(req, res, next);

      expect(multiMock.expire).toHaveBeenCalledWith(
        expect.any(String),
        Math.ceil(customWindow / 1000)
      );
    });
  });
});
