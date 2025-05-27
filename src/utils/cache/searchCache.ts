export class SearchCache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private readonly ttlMs: number;

  constructor(ttlMs = 30000) {
    this.ttlMs = ttlMs;
  }

  generateKey(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((obj, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          obj[key] = params[key];
        }
        return obj;
      }, {} as Record<string, any>);
    return JSON.stringify(sortedParams);
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    const now = Date.now();
    if (now - item.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  invalidateWhere(predicate: (key: string) => boolean): void {
    for (const key of this.cache.keys()) {
      if (predicate(key)) {
        this.cache.delete(key);
      }
    }
  }
}
