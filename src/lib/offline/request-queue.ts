import type { RequestOptions } from '../api/client';

interface QueuedRequest {
  id: string;
  endpoint: string;
  options: RequestOptions;
  priority: number;
  dependencies: string[];
}

type RequestExecutor = <T>(endpoint: string, options: RequestOptions) => Promise<T>;

const queue: QueuedRequest[] = [];
let executor: RequestExecutor | null = null;

export function setRequestExecutor(fn: RequestExecutor) {
  executor = fn;
}

export async function queueRequest(endpoint: string, options: RequestOptions): Promise<string> {
  const id = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const priority = options.priority ?? 0;
  const dependencies = options.dependencies ?? [];

  // Replace existing request with same endpoint + method
  const conflictIndex = queue.findIndex(
    r => r.endpoint === endpoint && r.options.method === options.method
  );
  const item: QueuedRequest = { id, endpoint, options, priority, dependencies };

  if (conflictIndex !== -1) {
    queue[conflictIndex] = item;
  } else {
    queue.push(item);
  }

  queue.sort((a, b) => b.priority - a.priority);
  return id;
}

function depsSatisfied(item: QueuedRequest): boolean {
  return !item.dependencies.some(dep => queue.some(q => q.id === dep));
}

export async function processQueue(): Promise<void> {
  if (!executor) return;

  for (let i = 0; i < queue.length; ) {
    const item = queue[i];
    if (!depsSatisfied(item)) {
      i++;
      continue;
    }
    try {
      await executor(item.endpoint, item.options);
      queue.splice(i, 1);
    } catch (err: any) {
      if (isNetworkError(err)) {
        // stop processing if still offline
        break;
      }
      queue.splice(i, 1);
    }
  }
}

export function getQueueLength() {
  return queue.length;
}

export function clearQueue() {
  queue.splice(0, queue.length);
}

function isNetworkError(error: any): boolean {
  return (
    error &&
    !error.response &&
    (error.code === 'NETWORK_ERROR' || /network/i.test(error.message))
  );
}
