export type ErrorPriority = 'critical' | 'normal';

export interface SerializedError {
  message: string;
  stack?: string;
}

interface QueueItem {
  id: string;
  error: SerializedError;
  priority: ErrorPriority;
  attempts: number;
  maxAttempts: number;
  nextRetry: number;
}

export type ErrorProcessor = (error: SerializedError) => Promise<void>;

export class OfflineErrorQueue {
  private storageKey: string;
  private baseDelay: number;
  private queue: QueueItem[] = [];

  constructor(storageKey = 'um-error-queue', baseDelay = 1000) {
    this.storageKey = storageKey;
    this.baseDelay = baseDelay;
    this.queue = this.load();
  }

  enqueue(error: Error, priority: ErrorPriority = 'normal', maxAttempts = 5): string {
    const item: QueueItem = {
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      error: { message: error.message, stack: error.stack },
      priority,
      attempts: 0,
      maxAttempts,
      nextRetry: Date.now(),
    };
    this.queue.push(item);
    this.persist();
    return item.id;
  }

  async process(processor: ErrorProcessor): Promise<void> {
    // Sort by priority so critical errors are handled first
    this.queue.sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'critical' ? -1 : 1));

    const now = Date.now();
    const remaining: QueueItem[] = [];

    for (const item of this.queue) {
      if (item.attempts >= item.maxAttempts) {
        continue; // drop
      }
      if (item.nextRetry > now) {
        remaining.push(item);
        continue;
      }

      try {
        await processor(item.error);
      } catch {
        item.attempts += 1;
        if (item.attempts < item.maxAttempts) {
          item.nextRetry = Date.now() + this.getRetryDelay(item.attempts);
          remaining.push(item);
        }
        continue;
      }
      // success -> do not requeue
    }

    this.queue = remaining;
    this.persist();
  }

  private getRetryDelay(attempt: number): number {
    return this.baseDelay * Math.pow(2, attempt - 1);
  }

  private persist() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    }
  }

  private load(): QueueItem[] {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        try {
          return JSON.parse(raw) as QueueItem[];
        } catch {
          return [];
        }
      }
    }
    return [];
  }
}

export const offlineErrorQueue = new OfflineErrorQueue();
