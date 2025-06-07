import { MemoryCache } from '@/lib/cache';

/**
 * Cache for permission checks keyed by user and permission parameters.
 * TTL is short to avoid stale permissions.
 */
export const permissionCheckCache = new MemoryCache<string, boolean>({ ttl: 5000 });
