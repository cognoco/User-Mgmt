import { getRedisClient } from '@/src/lib/cache/redisClient';
import { errorLogger } from '@/lib/monitoring/errorLogger';
import { telemetry } from '@/lib/monitoring/errorSystem';

export type CacheUpdateHandler = (key: string) => void;

const subscribers: Record<string, any> = {};

export function subscribeInvalidation(channel: string, handler: CacheUpdateHandler) {
  const client = getRedisClient();
  if (!client || subscribers[channel]) return;
  try {
    const sub = client.subscribe<string>(channel);
    sub.on('message', (msg: any) => {
      try {
        handler(String(msg.message));
      } catch (err) {
        errorLogger.error('Cache invalidation handler failed', { channel, err });
        telemetry.recordError({ type: 'CACHE_SYNC_ERROR', message: String(err) });
      }
    });
    subscribers[channel] = sub;
  } catch (err) {
    errorLogger.error('Cache subscribe failed', { channel, err });
    telemetry.recordError({ type: 'CACHE_SYNC_ERROR', message: String(err) });
  }
}

export async function broadcastInvalidation(channel: string, key: string) {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.publish(channel, key);
  } catch (err) {
    errorLogger.error('Cache invalidation publish failed', { channel, key, err });
    telemetry.recordError({ type: 'CACHE_SYNC_ERROR', message: String(err) });
  }
}

