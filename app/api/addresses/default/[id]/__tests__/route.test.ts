import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getApiAddressService } from '@/lib/api/address/factory';

vi.mock('@/lib/api/address/factory', () => ({
  getApiAddressService: vi.fn(),
}));

describe('default address API', () => {
  const service = { setDefaultAddress: vi.fn(async () => {}) } as any;

  beforeEach(() => {
    vi.mocked(getApiAddressService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('sets default address', async () => {
    const req = new NextRequest('http://test', { method: 'POST' });
    req.headers.set('x-user-id', 'u1');
    const res = await POST(req as any, { params: { id: '1' } });
    expect(res.status).toBe(204);
    expect(service.setDefaultAddress).toHaveBeenCalledWith('1', 'u1');
  });
});
