import { useEffect, useRef, useState } from 'react';

export interface OptimisticAction<T> {
  apply: (data: T) => Promise<void>;
  optimisticData: T;
}

/**
 * Provides optimistic UI updates with automatic rollback on failure
 * and offline queue synchronization.
 */
export function useOptimistic<T>(initial: T) {
  const [data, setData] = useState(initial);
  const queue = useRef<OptimisticAction<T>[]>([]);
  const rollingBack = useRef(false);
  const [isFlushing, setIsFlushing] = useState(false);

  const flushQueue = async () => {
    if (queue.current.length === 0 || rollingBack.current) return;
    setIsFlushing(true);
    const action = queue.current[0];
    try {
      await action.apply(action.optimisticData);
      queue.current.shift();
      await flushQueue();
    } catch {
      rollingBack.current = true;
      setData(initial);
      queue.current = [];
      rollingBack.current = false;
    } finally {
      setIsFlushing(false);
    }
  };

  useEffect(() => {
    window.addEventListener('online', flushQueue);
    return () => window.removeEventListener('online', flushQueue);
  }, []);

  const run = async (apply: (data: T) => Promise<void>, optimisticData: T) => {
    const prev = data;
    setData(optimisticData);
    const action = { apply, optimisticData };
    if (navigator.onLine) {
      try {
        await apply(optimisticData);
      } catch {
        setData(prev);
      }
    } else {
      queue.current.push(action);
    }
  };

  return {
    data,
    setData,
    run,
    queueLength: queue.current.length,
    flushQueue,
    isFlushing,
  };
}
