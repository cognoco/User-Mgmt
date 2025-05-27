import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '../error-handling';
import { ApiError } from '@/lib/api/common/api-error';
import { createErrorResponse } from '@/lib/api/common/response-formatter';
import { logUserAction } from '@/lib/audit/auditLogger';

vi.mock('@/lib/audit/auditLogger', () => ({ logUserAction: vi.fn() }));
vi.mock('@/lib/api/common/response-formatter', () => ({
  createErrorResponse: vi.fn((err: ApiError) =>
    NextResponse.json(err.toResponse(), { status: err.status })
  ),
}));

describe('withErrorHandling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const req = new NextRequest('http://test');

  it('handles ApiError and logs it', async () => {
    const handler = vi.fn(async () => {
      throw new ApiError('test/error', 'boom', 400);
    });

    const res = await withErrorHandling(handler, req);
    expect(res.status).toBe(400);
    expect(createErrorResponse).toHaveBeenCalled();
    expect(logUserAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'API_ERROR', status: 'FAILURE' })
    );
  });

  it('wraps unknown errors', async () => {
    const handler = vi.fn(async () => {
      throw new Error('oops');
    });

    const res = await withErrorHandling(handler, req);
    expect(res.status).toBe(500);
    expect(createErrorResponse).toHaveBeenCalled();
  });
});
