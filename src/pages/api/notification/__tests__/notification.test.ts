import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../[...notification]';
import { getApiNotificationService } from '@/services/notification/factory';
import { testGet } from '@/tests/utils/api-testing-utils';

vi.mock('@/services/notification/factory', () => ({ getApiNotificationService: vi.fn() }));

describe('GET /api/notification/list', () => {
  const mockService = { getUserNotifications: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiNotificationService as unknown as vi.Mock).mockReturnValue(mockService);
    mockService.getUserNotifications.mockResolvedValue([]);
  });

  it('returns notifications', async () => {
    const { status } = await testGet(handler, { query: { notification: ['list'], userId: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(status).toBe(200);
  });

  it('invalid params', async () => {
    const { status } = await testGet(handler, { query: { notification: ['list'] } });
    expect(status).toBe(400);
  });
});
