import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/health/route';
import { getHealthService } from '@/services/health';

vi.mock('@/services/health', () => ({
  getHealthService: vi.fn()
}));

describe('/api/health', () => {
  it('should return healthy status', async () => {
    const mockHealthService = {
      checkSystemHealth: vi.fn().mockResolvedValue({ status: 'ok' })
    } as any;
    (getHealthService as unknown as vi.Mock).mockReturnValue(mockHealthService);

    const response = await GET();
    const data = await response.json();

    expect(data.status).toBe('healthy');
    expect(data.services).toEqual({ status: 'ok' });
  });
});
