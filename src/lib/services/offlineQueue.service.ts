import { TypedEventEmitter } from '@/lib/utils/typedEventEmitter';

export interface OfflineQueueEvent {
  type: 'update';
  length: number;
}

export interface OfflineQueueItem {
  id: string;
  /**
   * Function that executes the queued request.
   */
  run: () => Promise<void>;
  /**
   * Higher priority items are processed first.
   */
  priority: number;
}

/**
 * Service managing queued network requests when offline.
 */
export class OfflineQueueService extends TypedEventEmitter<OfflineQueueEvent> {
  private queue: OfflineQueueItem[] = [];

  /** Enqueue a request to be processed later. */
  enqueue(run: () => Promise<void>, priority = 0): string {
    const id = `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.queue.push({ id, run, priority });
    this.sortQueue();
    this.emit({ type: 'update', length: this.queue.length });
    return id;
  }

  /** Get queued items. */
  getItems(): OfflineQueueItem[] {
    return [...this.queue];
  }

  /** Prioritize a specific request. */
  prioritize(id: string, priority: number): void {
    const item = this.queue.find(q => q.id === id);
    if (item) {
      item.priority = priority;
      this.sortQueue();
      this.emit({ type: 'update', length: this.queue.length });
    }
  }

  /** Cancel a specific queued request. */
  cancel(id: string): void {
    this.queue = this.queue.filter(q => q.id !== id);
    this.emit({ type: 'update', length: this.queue.length });
  }

  /** Remove all queued requests. */
  clear(): void {
    this.queue = [];
    this.emit({ type: 'update', length: 0 });
  }

  /** Process the queued requests in order. */
  async process(): Promise<void> {
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      try {
        await item.run();
      } catch {
        // Silently ignore individual failures
      }
      this.emit({ type: 'update', length: this.queue.length });
    }
  }

  /** Subscribe to queue length updates. */
  subscribe(cb: (length: number) => void): () => void {
    return this.onType('update', e => cb(e.length));
  }

  private sortQueue() {
    this.queue.sort((a, b) => b.priority - a.priority);
  }
}

export const offlineQueue = new OfflineQueueService();

export function subscribeToQueueUpdates(cb: (length: number) => void) {
  const off = offlineQueue.subscribe(cb);
  subscriptions.set(cb, off);
}

export function unsubscribeFromQueueUpdates(cb: (length: number) => void) {
  const off = subscriptions.get(cb);
  if (off) {
    off();
    subscriptions.delete(cb);
  }
}

export async function processQueue() {
  await offlineQueue.process();
}

export function clearQueue() {
  offlineQueue.clear();
}

/** Map to track callbacks for subscription management */
const subscriptions = new Map<(length: number) => void, () => void>();

export async function verifyConnectivity(): Promise<boolean> {
  try {
    const res = await fetch('/api');
    return res.ok;
  } catch {
    return false;
  }
}
