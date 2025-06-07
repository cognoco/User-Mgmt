import type { INotificationDataProvider } from '@/core/notification/INotificationDataProvider';
import { InMemoryNotificationProvider } from '@/adapters/notification/inMemoryProvider';

export function createInMemoryNotificationProvider(): INotificationDataProvider {
  return new InMemoryNotificationProvider();
}

export function createNotificationProvider(config?: {
  type?: 'in-memory' | string;
  options?: Record<string, any>;
}): INotificationDataProvider {
  if (!config || config.type === 'in-memory') {
    return createInMemoryNotificationProvider();
  }
  throw new Error(`Unsupported notification provider type: ${config.type}`);
}

export default createInMemoryNotificationProvider;
