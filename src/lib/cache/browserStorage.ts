export interface BrowserCacheEntry<V> {
  value: V;
  expires: number;
}

function now() {
  return Date.now();
}

function isBrowser() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function getFromBrowser<V>(key: string): V | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as BrowserCacheEntry<V>;
    if (entry.expires && entry.expires < now()) {
      window.localStorage.removeItem(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

export function setInBrowser<V>(key: string, value: V, ttl: number = 24 * 60 * 60 * 1000): void {
  if (!isBrowser()) return;
  const entry: BrowserCacheEntry<V> = { value, expires: now() + ttl };
  try {
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

export function removeFromBrowser(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
