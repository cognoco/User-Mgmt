import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import { Redis, type UpstashResponse } from '@upstash/redis';
import { rateLimit, checkRateLimit } from '../rate-limit';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock Redis with proper response types
vi.mock('@upstash/redis', () => {
  const createResponse = (value: number): UpstashResponse<number> => ({
    result: value,
    error: undefined,
  });
  return {
    Redis: vi.fn(() => ({
      multi: vi.fn(() => ({
        zremrangebyscore: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        zcount: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          createResponse(0),  // zremrangebyscore response
          createResponse(1),  // zadd response
          createResponse(0),  // zcount response
          createResponse(1),  // expire response
        ]),
      })),
    })),
  };
});

// Mock NextRequest and NextApiRequest
const mockNextReq = (ip = '127.0.0.1', headers = {}) => ({
  ip,
  headers: new Headers(headers),
}) as unknown as NextRequest;

const mockApiReq = (ip = '127.0.0.1', headers = {}) => ({
  socket: { remoteAddress: ip },
  headers: headers,
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
  let redis: Redis;
  let next: () => Promise<void>;

  beforeEach(() => {
    redis = new Redis({ url: 'fake-url', token: 'fake-token' });
    next = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', async () => {
      const req = mockNextReq();
      vi.mocked(redis.multi().exec).mockResolvedValueOnce([
        { result: 0, error: undefined },
        { result: 1, error: undefined },
        { result: 5, error: undefined },  // 5 requests in window
        { result: 1, error: undefined },
      ]);

      const isLimited = await checkRateLimit(req, { max: 10 });

      expect(isLimited).toBe(false);
    });

    it('should block requests exceeding rate limit', async () => {
      const req = mockNextReq();
      vi.mocked(redis.multi().exec).mockResolvedValueOnce([
        { result: 0, error: undefined },
        { result: 1, error: undefined },
        { result: 15, error: undefined },  // 15 requests in window
        { result: 1, error: undefined },
      ]);

      const isLimited = await checkRateLimit(req, { max: 10 });

      expect(isLimited).toBe(true);
    });

    it('should use IP address for rate limit key', async () => {
      const ip = '192.168.1.1';
      const req = mockNextReq(ip);
      const multi = redis.multi();

      await checkRateLimit(req);

      expect(multi.zadd).toHaveBeenCalledWith(
        expect.stringContaining(ip),
        expect.any(Object)
      );
    });

    it('should use x-forwarded-for header when IP is not available', async () => {
      const forwardedIp = '10.0.0.1';
      const req = mockNextReq(undefined, {
        'x-forwarded-for': forwardedIp,
      });
      const multi = redis.multi();

      await checkRateLimit(req);

      expect(multi.zadd).toHaveBeenCalledWith(
        expect.stringContaining(forwardedIp),
        expect.any(Object)
      );
    });

    it('should clean up old entries before checking limit', async () => {
      const req = mockNextReq();
      const multi = redis.multi();
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutes

      await checkRateLimit(req, { windowMs });

      expect(multi.zremrangebyscore).toHaveBeenCalledWith(
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
      vi.mocked(redis.multi().exec).mockResolvedValueOnce([
        { result: 0, error: undefined },
        { result: 1, error: undefined },
        { result: 5, error: undefined },  // 5 requests
        { result: 1, error: undefined },
      ]);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(429);
    });

    it('should block requests exceeding limit', async () => {
      const req = mockApiReq();
      const res = mockRes();
      const middleware = rateLimit({ max: 10 });
      vi.mocked(redis.multi().exec).mockResolvedValueOnce([
        { result: 0, error: undefined },
        { result: 1, error: undefined },
        { result: 15, error: undefined },  // 15 requests
        { result: 1, error: undefined },
      ]);

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
      vi.mocked(redis.multi().exec).mockResolvedValueOnce([
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
      vi.mocked(redis.multi().exec).mockRejectedValueOnce(new Error('Redis error'));

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled(); // Should still allow request
    });

    it('should use custom window size', async () => {
      const req = mockApiReq();
      const res = mockRes();
      const customWindow = 30 * 60 * 1000; // 30 minutes
      const middleware = rateLimit({ windowMs: customWindow });
      const multi = redis.multi();

      await middleware(req, res, next);

      expect(multi.expire).toHaveBeenCalledWith(
        expect.any(String),
        Math.ceil(customWindow / 1000)
      );
    });
  });
});
