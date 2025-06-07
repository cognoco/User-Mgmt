import { describe, it, expect, vi } from 'vitest';
import { broadcastInvalidation, subscribeInvalidation } from '@/src/lib/cache/cacheSync'52;
import { getRedisClient } from '@/src/lib/cache/redisClient'131;

vi.mock('../redis-client', () => ({ getRedisClient: vi.fn() }));

class FakeSub {
  on = vi.fn();
}

describe('cache-sync', () => {
  it('publishes invalidation and registers handler', async () => {
    const publish = vi.fn();
    const sub = new FakeSub();
    (getRedisClient as any).mockReturnValue({ publish, subscribe: vi.fn(() => sub) });

    const handler = vi.fn();
    subscribeInvalidation('ch', handler);

    // simulate message
    const msg = { message: 'a' } as any;
    const cb = sub.on.mock.calls[0][1];
    cb(msg);
    expect(handler).toHaveBeenCalledWith('a');

    await broadcastInvalidation('ch', 'b');
    expect(publish).toHaveBeenCalledWith('ch', 'b');
  });
});

