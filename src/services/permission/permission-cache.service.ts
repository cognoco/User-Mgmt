import { MemoryCache, MultiLevelCache, RedisCache, getRedisClient } from '@/lib/cache';
import type { UserRole } from '@/core/permission/models';

export interface PermissionCacheMetrics {
  userRoles: { hits: number; misses: number };
  userPermissions: { hits: number; misses: number };
  resourcePermissions: { hits: number; misses: number };
}

const TTL = 30_000;

function createRedisCache<V>(prefix: string) {
  const client = getRedisClient();
  return client ? new RedisCache<V>(client, { prefix }) : undefined;
}

export class PermissionCacheService {
  userRoles = new MultiLevelCache<string, UserRole[]>(
    new MemoryCache({ ttl: TTL }),
    createRedisCache('role:'),
    TTL,
  );

  userPermissions = new MultiLevelCache<string, boolean>(
    new MemoryCache({ ttl: TTL }),
    createRedisCache('perm:'),
    TTL,
  );

  resourcePermissions = new MultiLevelCache<string, boolean>(
    new MemoryCache({ ttl: TTL }),
    createRedisCache('res:'),
    TTL,
  );

  getMetrics(): PermissionCacheMetrics {
    return {
      userRoles: this.userRoles.metrics,
      userPermissions: this.userPermissions.metrics,
      resourcePermissions: this.resourcePermissions.metrics,
    };
  }

  async clearUser(userId: string) {
    await this.userRoles.delete(userId);
    await this.userPermissions.deleteWhere(k => k.startsWith(`${userId}:`));
    await this.resourcePermissions.deleteWhere(k => k.startsWith(`${userId}:`));
  }

  async clearResource(resourceType: string, resourceId: string) {
    await this.resourcePermissions.deleteWhere(k => k.includes(`:${resourceType}:${resourceId}`));
  }
}

export const permissionCacheService = new PermissionCacheService();
