import { it, expect, vi } from 'vitest';
import { withValidation } from '@/middleware/validation';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ name: z.string() });

it('validates request body when data not provided', async () => {
  const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ name: 'john' }) });
  const handler = vi.fn(async () => NextResponse.json({ ok: true }));
  const res = await withValidation(schema, handler, req as any);
  expect(res.status).toBe(200);
  expect(handler).toHaveBeenCalledWith(req, { name: 'john' });
});

it('uses provided data instead of body', async () => {
  const req = new Request('http://test');
  const handler = vi.fn(async () => NextResponse.json({ ok: true }));
  const res = await withValidation(schema, handler, req as any, { name: 'jane' });
  expect(res.status).toBe(200);
  expect(handler).toHaveBeenCalledWith(req, { name: 'jane' });
});

it('returns validation error when invalid', async () => {
  const req = new Request('http://test', { method: 'POST', body: JSON.stringify({}) });
  const handler = vi.fn();
  const res = await withValidation(schema, handler, req as any);
  expect(res.status).toBe(400);
  const body = await res.json();
  expect(body.error.code).toBe('VALIDATION_REQUEST_001');
});
