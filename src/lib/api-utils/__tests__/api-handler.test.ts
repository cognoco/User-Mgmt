import { describe, it, expect } from 'vitest';
import { createApiHandler } from '../api-handler';
import { ApiError, ERROR_CODES } from '@/lib/api/common';
import { createApiMocks } from '@/tests/utils/api-testing-utils';

describe('createApiHandler', () => {
  it('returns 200 for successful handler', async () => {
    const handler = createApiHandler({
      methods: ['GET'],
      async handler() {
        return { ok: true };
      }
    });
    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(res.getJsonData()).toEqual({ success: true, data: { ok: true } });
  });

  it('returns 400 for invalid method', async () => {
    const handler = createApiHandler({
      methods: ['POST'],
      async handler() {
        return null;
      }
    });
    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
    expect(res.getHeader('Allow')).toEqual(['POST']);
  });

  it('handles ApiError', async () => {
    const handler = createApiHandler({
      methods: ['GET'],
      async handler() {
        throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'oops', 400);
      }
    });
    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
    expect(res.getJsonData().error.code).toBe(ERROR_CODES.INVALID_REQUEST);
  });

  it('handles unexpected error', async () => {
    const handler = createApiHandler({
      methods: ['GET'],
      async handler() {
        throw new Error('oops');
      }
    });
    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(500);
    expect(res.getJsonData().error.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('does not send response twice if handler already sent', async () => {
    const handler = createApiHandler({
      methods: ['GET'],
      async handler(req, res) {
        res.status(201).json({ success: true });
        return { ok: true };
      }
    });
    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    expect(res.getJsonData()).toEqual({ success: true });
  });

  it('handles roles and schema options', async () => {
    const handler = createApiHandler({
      methods: ['GET'],
      requiredRoles: ['admin'],
      schema: {},
      async handler() {
        return 'ok';
      }
    });
    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
  });

  it('falls back to default code when ApiError has no code', async () => {
    const handler = createApiHandler({
      methods: ['GET'],
      async handler() {
        throw new ApiError(undefined as any, 'bad', 418);
      }
    });
    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(418);
    expect(res.getJsonData().error.code).toBe('API_ERROR');
  });
});
