/* eslint-disable @typescript-eslint/no-unused-vars */
declare module 'lru-cache' {
  export interface LRUCacheOptions<K = any, V = any> {
    max?: number;
    ttl?: number;
  }

  export class LRUCache<K = any, V = any> {
    constructor(options?: LRUCacheOptions<K, V>);
    set(key: K, value: V): void;
    get(key: K): V | undefined;
    delete(key: K): void;
    clear(): void;
    has(key: K): boolean;
  }
} 