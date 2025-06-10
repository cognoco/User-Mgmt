import { Redis } from '@upstash/redis';
import { redisConfig } from '@/lib/config';

let client: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (client) return client;
  if (redisConfig.enabled && redisConfig.url && redisConfig.token) {
    client = new Redis({ url: redisConfig.url, token: redisConfig.token });
  }
  return client;
}
