import { describe, it, expect } from 'vitest';
import { GET } from '@app/api/openapi/route';
import { NextRequest } from 'next/server';

const createRequest = () => new NextRequest('http://localhost/api/openapi');

describe('GET /api/openapi', () => {
  it('returns the openapi spec', async () => {
    const res = await GET(createRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.openapi).toBe('3.0.3');
  });
});
